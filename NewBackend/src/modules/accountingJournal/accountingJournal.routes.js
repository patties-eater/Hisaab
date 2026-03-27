const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedUserId } = require("../../utils/ownership");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const voucherResult = await pool.query(
      `SELECT *
       FROM journal_vouchers
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT 200`,
      [userId]
    );

    const lineResult = await pool.query(
      `SELECT jl.*, jv.user_id
       FROM journal_lines jl
       INNER JOIN journal_vouchers jv ON jv.id = jl.voucher_id
       WHERE jv.user_id = $1
       ORDER BY jv.date DESC, jv.created_at DESC, jl.id ASC`,
      [userId]
    );

    const linesByVoucherId = lineResult.rows.reduce((acc, line) => {
      acc[line.voucher_id] = acc[line.voucher_id] || [];
      acc[line.voucher_id].push(line);
      return acc;
    }, {});

    const data = voucherResult.rows.map((voucher) => ({
      ...voucher,
      lines: linesByVoucherId[voucher.id] || [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching accounting journal:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
