const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedAccountMode, getAuthenticatedUserId } = require("../../utils/ownership");
const { createJournalEntry } = require("../../utils/journal");
const { createJournalVoucher } = require("../../utils/accountingJournal");

const router = express.Router();

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

    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO transactions (name, type, title, amount, date, user_id, account_mode) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, type, title, amount, txDate, userId, accountMode]
    );

    await createJournalEntry(client, {
      entityType: "transaction",
      entityId: result.rows[0].id,
      action: "create",
      userId,
      amount,
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
        type === "Income"
          ? [
              {
                accountName: "Cash",
                accountType: "Asset",
                debit: amount,
                credit: 0,
              },
              {
                accountName: "Income",
                accountType: "Revenue",
                debit: 0,
                credit: amount,
              },
            ]
          : [
              {
                accountName: "Expense",
                accountType: "Expense",
                debit: amount,
                credit: 0,
              },
              {
                accountName: "Cash",
                accountType: "Asset",
                debit: 0,
                credit: amount,
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
