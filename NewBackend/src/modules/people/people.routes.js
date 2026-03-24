const express = require("express");
const router = express.Router();
const pool = require("../../config/db");
const { getAuthenticatedUserId } = require("../../utils/ownership");

// GET all debt/credit transactions
router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await pool.query(`
      SELECT 
        id,
        type,
        amount,
        rate,
        duration,
        date,
        notes,
        estimated_interest,
        created_at
      FROM debt_credit
      WHERE user_id = $1
      ORDER BY date DESC;
    `, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Failed to fetch people data:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
