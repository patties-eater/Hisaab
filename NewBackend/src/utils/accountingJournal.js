const pool = require("../config/db");

async function ensureAccountingJournalTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_vouchers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      reference_no VARCHAR(100),
      description TEXT,
      source_type VARCHAR(50) NOT NULL,
      source_id UUID,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_lines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      voucher_id UUID NOT NULL REFERENCES journal_vouchers(id) ON DELETE CASCADE,
      account_name VARCHAR(100) NOT NULL,
      account_type VARCHAR(50) NOT NULL,
      debit NUMERIC(14, 2) NOT NULL DEFAULT 0,
      credit NUMERIC(14, 2) NOT NULL DEFAULT 0,
      notes TEXT
    );
  `);
}

function normalizeAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error("A journal voucher needs at least two lines");
  }

  let debitTotal = 0;
  let creditTotal = 0;

  for (const line of lines) {
    const debit = normalizeAmount(line.debit);
    const credit = normalizeAmount(line.credit);

    if (debit < 0 || credit < 0) {
      throw new Error("Debit or credit cannot be negative");
    }

    if ((debit === 0 && credit === 0) || (debit > 0 && credit > 0)) {
      throw new Error("Each journal line must have either debit or credit");
    }

    debitTotal += debit;
    creditTotal += credit;
  }

  if (normalizeAmount(debitTotal) !== normalizeAmount(creditTotal)) {
    throw new Error("Journal voucher is not balanced");
  }
}

async function createJournalVoucher(client, {
  date,
  referenceNo = null,
  description = null,
  sourceType,
  sourceId = null,
  userId = null,
  lines,
}) {
  validateLines(lines);

  const voucherResult = await client.query(
    `INSERT INTO journal_vouchers
     (date, reference_no, description, source_type, source_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [date, referenceNo, description, sourceType, sourceId, userId]
  );

  const voucher = voucherResult.rows[0];
  const insertedLines = [];

  for (const line of lines) {
    const lineResult = await client.query(
      `INSERT INTO journal_lines
       (voucher_id, account_name, account_type, debit, credit, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        voucher.id,
        line.accountName,
        line.accountType,
        normalizeAmount(line.debit),
        normalizeAmount(line.credit),
        line.notes || null,
      ]
    );

    insertedLines.push(lineResult.rows[0]);
  }

  return { ...voucher, lines: insertedLines };
}

module.exports = {
  ensureAccountingJournalTables,
  createJournalVoucher,
};
