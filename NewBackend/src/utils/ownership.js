const pool = require("../config/db");

async function ensureOwnershipColumns() {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) NOT NULL DEFAULT 'en';
  `);

  await pool.query(`
    ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS debt_credit_id UUID REFERENCES debt_credit(id) ON DELETE SET NULL;
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS closed_at DATE;
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS settled_interest NUMERIC(14, 2);
  `);

  await pool.query(`
    ALTER TABLE debt_credit
    ADD COLUMN IF NOT EXISTS settlement_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
  `);
}

function getAuthenticatedUserId(req) {
  return req.user?.id;
}

module.exports = {
  ensureOwnershipColumns,
  getAuthenticatedUserId,
};
