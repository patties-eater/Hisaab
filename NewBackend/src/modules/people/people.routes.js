const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const { getAuthenticatedAccountMode, getAuthenticatedUserId } = require("../../utils/ownership");

// GET grouped people records from debt/credit entries
router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const result = await pool.query(`
      SELECT 
        LOWER(TRIM(name)) AS person_key,
        COALESCE(NULLIF(TRIM(phone), ''), '') AS phone,
        (ARRAY_AGG(name ORDER BY COALESCE(closed_at, date) DESC, created_at DESC))[1] AS name,
        SUM(CASE WHEN type = 'debt' THEN amount ELSE 0 END)::numeric(14, 2) AS total_debt,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END)::numeric(14, 2) AS total_credit,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END)::numeric(14, 2) AS net_balance,
        COUNT(*)::int AS record_count,
        MAX(COALESCE(closed_at, date)) AS last_activity_date
      FROM debt_credit
      WHERE user_id = $1
        AND account_mode = $2
      GROUP BY LOWER(TRIM(name)), COALESCE(NULLIF(TRIM(phone), ''), '')
      ORDER BY last_activity_date DESC, name ASC;
    `, [userId, accountMode]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Failed to fetch people data:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
