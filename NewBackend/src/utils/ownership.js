const pool = require("../config/db");

async function ensureOwnershipColumns() {
  await pool.query(`
    ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  `);
}

function getAuthenticatedUserId(req) {
  return req.user?.id;
}

module.exports = {
  ensureOwnershipColumns,
  getAuthenticatedUserId,
};
