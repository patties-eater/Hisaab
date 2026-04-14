const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedAccountMode, getAuthenticatedUserId } = require("../../utils/ownership");
const { createJournalEntry } = require("../../utils/journal");
const { createJournalVoucher } = require("../../utils/accountingJournal");

const router = express.Router();

async function getNetIncomeBalance(client, userId, accountMode) {
  const result = await client.query(
    `
      SELECT
        COALESCE(SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE 0 END), 0) AS income_total,
        COALESCE(SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END), 0) AS expense_total
      FROM transactions
      WHERE user_id = $1 AND account_mode = $2
    `,
    [userId, accountMode],
  );

  const incomeTotal = Number(result.rows[0]?.income_total) || 0;
  const expenseTotal = Number(result.rows[0]?.expense_total) || 0;

  return {
    incomeTotal,
    expenseTotal,
    netBalance: incomeTotal - expenseTotal,
  };
}

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND account_mode = $2 ORDER BY date DESC, created_at DESC",
      [userId, accountMode]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const { name, type, title, amount, date } = req.body;
    const txDate = date || new Date().toISOString().split("T")[0];
    const normalizedType = String(type || "").toLowerCase();
    const numericAmount = Number(amount);

    if (!name || !title || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please fill in a valid amount and details.",
      });
    }

    if (!["income", "expense"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Please choose income or expense.",
      });
    }

    await client.query("BEGIN");

    if (normalizedType === "expense") {
      const { netBalance } = await getNetIncomeBalance(client, userId, accountMode);

      if (numericAmount > netBalance) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "You cannot add this expense because it exceeds your available income.",
        });
      }
    }

    const result = await client.query(
      "INSERT INTO transactions (name, type, title, amount, date, user_id, account_mode) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, type, title, numericAmount, txDate, userId, accountMode]
    );

    await createJournalEntry(client, {
      entityType: "transaction",
      entityId: result.rows[0].id,
      action: "create",
      userId,
      amount: numericAmount,
      referenceNo: result.rows[0].id,
      afterData: result.rows[0],
      notes: `Created ${type} transaction`,
      accountMode,
    });

    await createJournalVoucher(client, {
      date: txDate,
      referenceNo: result.rows[0].id,
      description: `${type} transaction - ${title || name || "Manual entry"}`,
      sourceType: "transaction",
      sourceId: result.rows[0].id,
      userId,
      accountMode,
      lines:
        normalizedType === "income"
          ? [
              {
                accountName: "Cash",
                accountType: "Asset",
                debit: numericAmount,
                credit: 0,
              },
              {
                accountName: "Income",
                accountType: "Revenue",
                debit: 0,
                credit: numericAmount,
              },
            ]
          : [
              {
                accountName: "Expense",
                accountType: "Expense",
                debit: numericAmount,
                credit: 0,
              },
              {
                accountName: "Cash",
                accountType: "Asset",
                debit: 0,
                credit: numericAmount,
              },
            ],
    });

    await client.query("COMMIT");
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error adding transaction:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
