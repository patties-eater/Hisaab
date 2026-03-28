const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedAccountMode, getAuthenticatedUserId } = require("../../utils/ownership");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const result = await pool.query(
      `SELECT *
       FROM journal_entries
       WHERE user_id = $1 AND account_mode = $2
       ORDER BY created_at DESC, id DESC
       LIMIT 200`,
      [userId, accountMode]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching journal entries:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
