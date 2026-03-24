const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedUserId } = require("../../utils/ownership");


const router = express.Router();

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST a new transaction
router.post("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { name, type, title, amount, date } = req.body;

    const result = await pool.query(
      "INSERT INTO transactions (name, type, title, amount, date, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, type, title, amount, date || new Date(), userId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
