const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedUserId } = require("../../utils/ownership");
const { createJournalEntry } = require("../../utils/journal");
const { createJournalVoucher } = require("../../utils/accountingJournal");

const router = express.Router();

function normalizeDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function formatDateOnly(date) {
  return date.toISOString().split("T")[0];
}

function addMonths(date, months) {
  const nextDate = new Date(date.getTime());
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months);
  return nextDate;
}

function daysBetween(start, end) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function getProratedMonths(recordDate, closingDate, durationMonths) {
  const openedAt = normalizeDate(recordDate);
  const closedAt = normalizeDate(closingDate);

  if (!openedAt || !closedAt) {
    return null;
  }

  if (closedAt.getTime() === openedAt.getTime()) {
    const firstMonthEnd = addMonths(openedAt, 1);
    const firstMonthDays = Math.max(daysBetween(openedAt, firstMonthEnd), 1);
    return Math.min(durationMonths, 1 / firstMonthDays);
  }

  if (closedAt.getTime() < openedAt.getTime()) {
    return 0;
  }

  let completedMonths = 0;

  while (completedMonths < durationMonths) {
    const nextMonthDate = addMonths(openedAt, completedMonths + 1);

    if (nextMonthDate.getTime() <= closedAt.getTime()) {
      completedMonths += 1;
      continue;
    }

    break;
  }

  if (completedMonths >= durationMonths) {
    return durationMonths;
  }

  const monthStart = addMonths(openedAt, completedMonths);
  const monthEnd = addMonths(openedAt, completedMonths + 1);
  const daysInCurrentMonthSlice = Math.max(daysBetween(monthStart, monthEnd), 1);
  const usedDaysInCurrentMonth = Math.max(daysBetween(monthStart, closedAt), 0);
  const partialMonth = Math.min(usedDaysInCurrentMonth / daysInCurrentMonthSlice, 1);

  return Math.min(durationMonths, completedMonths + partialMonth);
}

function calculateSettledInterest(recordDate, closingDate, amount, rate, durationMonths) {
  const elapsedMonths = getProratedMonths(recordDate, closingDate, durationMonths);

  if (elapsedMonths === null) {
    return null;
  }

  return Number((amount * (rate / 100) * elapsedMonths).toFixed(2));
}

router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await pool.query(
      `SELECT *
       FROM debt_credit
       WHERE user_id = $1
       ORDER BY COALESCE(closed_at, date) DESC, created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching debt/credit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = getAuthenticatedUserId(req);
    const { name, type, amount, rate, duration, date, notes } = req.body;

    if (!name || !type || !amount || !rate || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const numericAmount = Number(amount);
    const numericRate = Number(rate);
    const numericDuration = Number(duration);
    const estimatedInterest =
      numericAmount * (numericRate / 100) * numericDuration;
    const recordDate = date || formatDateOnly(new Date());

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO debt_credit
       (name, type, amount, rate, duration, estimated_interest, date, notes, user_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [
        name,
        type,
        numericAmount,
        numericRate,
        numericDuration,
        estimatedInterest,
        recordDate,
        notes || null,
        userId,
      ]
    );

    await createJournalEntry(client, {
      entityType: "debt_credit",
      entityId: result.rows[0].id,
      action: "create",
      userId,
      amount: numericAmount,
      referenceNo: result.rows[0].id,
      afterData: result.rows[0],
      notes: `Created ${type} record`,
    });

    await createJournalVoucher(client, {
      date: recordDate,
      referenceNo: result.rows[0].id,
      description: `New ${type} entry - ${name}`,
      sourceType: "debt_credit_create",
      sourceId: result.rows[0].id,
      userId,
      lines:
        type === "debt"
          ? [
              {
                accountName: "Cash",
                accountType: "Asset",
                debit: numericAmount,
                credit: 0,
              },
              {
                accountName: "Debt Payable",
                accountType: "Liability",
                debit: 0,
                credit: numericAmount,
              },
            ]
          : [
              {
                accountName: "Credit Receivable",
                accountType: "Asset",
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

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DebtCredit Save Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    client.release();
  }
});

router.post("/:id/close", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const recordId = req.params.id;
  const closeDate = normalizeDate(req.body?.closeDate);

  if (!recordId) {
    return res.status(400).json({ success: false, message: "Invalid record id" });
  }

  if (!closeDate) {
    return res.status(400).json({ success: false, message: "Valid close date is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const recordResult = await client.query(
      `SELECT *
       FROM debt_credit
       WHERE id = $1 AND user_id = $2
       FOR UPDATE`,
      [recordId, userId]
    );

    if (recordResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    const record = recordResult.rows[0];

    if (record.status === "closed") {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "This record is already closed" });
    }

    const openedAt = normalizeDate(record.date);

    if (!openedAt || closeDate.getTime() < openedAt.getTime()) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Close date cannot be before the original record date",
      });
    }

    const settledInterest = calculateSettledInterest(
      record.date,
      closeDate,
      Number(record.amount),
      Number(record.rate),
      Number(record.duration)
    );

    if (settledInterest === null) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Could not calculate interest" });
    }

    let transactionId = null;

    if (settledInterest > 0) {
      const transactionType = record.type === "credit" ? "Income" : "Expense";
      const transactionTitle = `${record.type === "credit" ? "Credit" : "Debt"} clearance interest`;

      const transactionResult = await client.query(
        `INSERT INTO transactions (name, type, title, amount, date, user_id, debt_credit_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          record.name,
          transactionType,
          transactionTitle,
          settledInterest,
          formatDateOnly(closeDate),
          userId,
          record.id,
        ]
      );

      transactionId = transactionResult.rows[0].id;
    }

    const updatedRecordResult = await client.query(
      `UPDATE debt_credit
       SET status = 'closed',
           closed_at = $1,
           settled_interest = $2,
           settlement_transaction_id = $3
       WHERE id = $4
       RETURNING *`,
      [formatDateOnly(closeDate), settledInterest, transactionId, record.id]
    );

    await createJournalEntry(client, {
      entityType: "debt_credit",
      entityId: record.id,
      action: "close",
      userId,
      amount: settledInterest,
      referenceNo: record.id,
      beforeData: record,
      afterData: {
        ...updatedRecordResult.rows[0],
        settlement_transaction_id: transactionId,
      },
      notes: `Closed ${record.type} record with auto ${record.type === "credit" ? "income" : "expense"} posting`,
    });

    if (transactionId !== null) {
      await createJournalEntry(client, {
        entityType: "transaction",
        entityId: transactionId,
        action: "create_from_clearance",
        userId,
        amount: settledInterest,
        referenceNo: record.id,
        afterData: {
          debt_credit_id: record.id,
          id: transactionId,
          amount: settledInterest,
          date: formatDateOnly(closeDate),
          type: record.type === "credit" ? "Income" : "Expense",
          title: `${record.type === "credit" ? "Credit" : "Debt"} clearance interest`,
          name: record.name,
        },
        notes: `Auto-posted clearance interest for ${record.type} record`,
      });
    }

    const closeDateString = formatDateOnly(closeDate);
    const closeLines =
      record.type === "debt"
        ? [
            {
              accountName: "Debt Payable",
              accountType: "Liability",
              debit: Number(record.amount),
              credit: 0,
            },
            {
              accountName: "Cash",
              accountType: "Asset",
              debit: 0,
              credit: Number(record.amount) + settledInterest,
            },
            ...(settledInterest > 0
              ? [
                  {
                    accountName: "Interest Expense",
                    accountType: "Expense",
                    debit: settledInterest,
                    credit: 0,
                  },
                ]
              : []),
          ]
        : [
            {
              accountName: "Cash",
              accountType: "Asset",
              debit: Number(record.amount) + settledInterest,
              credit: 0,
            },
            {
              accountName: "Credit Receivable",
              accountType: "Asset",
              debit: 0,
              credit: Number(record.amount),
            },
            ...(settledInterest > 0
              ? [
                  {
                    accountName: "Interest Income",
                    accountType: "Revenue",
                    debit: 0,
                    credit: settledInterest,
                  },
                ]
              : []),
          ];

    await createJournalVoucher(client, {
      date: closeDateString,
      referenceNo: record.id,
      description: `Close ${record.type} entry - ${record.name}`,
      sourceType: "debt_credit_close",
      sourceId: record.id,
      userId,
      lines: closeLines,
    });

    await client.query("COMMIT");

    res.json({
      success: true,
      data: {
        record: updatedRecordResult.rows[0],
        transactionCreated: transactionId !== null,
        settledInterest,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error closing debt/credit:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
