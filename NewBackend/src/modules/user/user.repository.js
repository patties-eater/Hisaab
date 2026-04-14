const pool = require("../../config/db");

async function findUserByUserId(userId) {
  const user = await pool.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);
  return result.rows[0];
}

module.exports = { findUserByUserId };