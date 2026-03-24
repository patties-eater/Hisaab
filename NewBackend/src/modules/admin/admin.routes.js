const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../../config/db");

const router = express.Router();

async function fetchAdminOverview() {
  const [usersResult, transactionsResult, debtCreditResult, latestUsersResult] =
    await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total_users FROM users"),
      pool.query("SELECT COUNT(*)::int AS total_transactions FROM transactions"),
      pool.query("SELECT COUNT(*)::int AS total_debt_credit FROM debt_credit"),
      pool.query(`
        SELECT
          u.id,
          u.email,
          u.created_at,
          COUNT(DISTINCT t.id)::int AS transactions_count,
          COUNT(DISTINCT d.id)::int AS debt_credit_count
        FROM users u
        LEFT JOIN transactions t ON t.user_id = u.id
        LEFT JOIN debt_credit d ON d.user_id = u.id
        GROUP BY u.id, u.email, u.created_at
        ORDER BY u.created_at DESC
      `),
    ]);

  return {
    stats: {
      totalUsers: usersResult.rows[0]?.total_users ?? 0,
      totalTransactions: transactionsResult.rows[0]?.total_transactions ?? 0,
      totalDebtCredit: debtCreditResult.rows[0]?.total_debt_credit ?? 0,
    },
    users: latestUsersResult.rows,
  };
}

router.get("/overview", async (req, res) => {
  try {
    const data = await fetchAdminOverview();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (id, email, password, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       RETURNING id, email, created_at`,
      [email, hashedPassword]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Admin create user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email) {
      const duplicate = await pool.query("SELECT id FROM users WHERE email = $1 AND id <> $2", [email, id]);
      if (duplicate.rows.length > 0) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${index++}`);
      values.push(hashedPassword);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $${index}
       RETURNING id, email, created_at`,
      values
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, email",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
