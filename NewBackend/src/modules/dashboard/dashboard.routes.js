// routes/dashboard.js
const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const { getAuthenticatedUserId } = require("../../utils/ownership");

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    // --- Income / Expense totals ---
    const incomeExpenseQuery = `
      SELECT
        SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE 0 END) AS income_total,
        SUM(CASE WHEN LOWER(type) = 'expense' THEN amount ELSE 0 END) AS expense_total
      FROM transactions
      WHERE user_id = $1;
    `;
    const incomeExpenseResult = await pool.query(incomeExpenseQuery, [userId]);

    // --- Debt / Credit totals ---
    const debtCreditQuery = `
      SELECT
        SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END) AS debt_total,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS credit_total
      FROM debt_credit
      WHERE user_id = $1
        AND COALESCE(status, 'active') = 'active';
    `;
    const debtCreditResult = await pool.query(debtCreditQuery, [userId]);

    // --- Return JSON ---
    res.json({
      success: true,
      data: {
        incomeTotal: Number(incomeExpenseResult.rows[0].income_total) || 0,
        expenseTotal: Number(incomeExpenseResult.rows[0].expense_total) || 0,
        debtTotal: Number(debtCreditResult.rows[0].debt_total) || 0,
        creditTotal: Number(debtCreditResult.rows[0].credit_total) || 0,
      },
    });
  } catch (err) {
    console.error("Dashboard route error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
