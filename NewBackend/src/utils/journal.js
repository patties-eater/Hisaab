const crypto = require("crypto");
const pool = require("../config/db");

async function ensureJournalTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID,
      action VARCHAR(50) NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      amount NUMERIC(14, 2),
      reference_no VARCHAR(100),
      before_data JSONB,
      after_data JSONB,
      notes TEXT,
      prev_hash TEXT,
      row_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

function stableStringify(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function buildJournalHash(payload) {
  return crypto
    .createHash("sha256")
    .update(
      [
        payload.entityType,
        payload.entityId || "",
        payload.action,
        payload.userId || "",
        payload.amount ?? "",
        payload.referenceNo || "",
        payload.createdAt,
        payload.prevHash || "",
        stableStringify(payload.beforeData),
        stableStringify(payload.afterData),
        payload.notes || "",
      ].join("|")
    )
    .digest("hex");
}

async function createJournalEntry(client, {
  entityType,
  entityId = null,
  action,
  userId = null,
  amount = null,
  referenceNo = null,
  beforeData = null,
  afterData = null,
  notes = null,
  createdAt = new Date().toISOString(),
}) {
  const previousEntryResult = await client.query(
    `SELECT row_hash
     FROM journal_entries
     ORDER BY created_at DESC, id DESC
     LIMIT 1`
  );

  const prevHash = previousEntryResult.rows[0]?.row_hash || null;
  const rowHash = buildJournalHash({
    entityType,
    entityId,
    action,
    userId,
    amount,
    referenceNo,
    beforeData,
    afterData,
    notes,
    createdAt,
    prevHash,
  });

  const insertResult = await client.query(
    `INSERT INTO journal_entries
     (entity_type, entity_id, action, user_id, amount, reference_no, before_data, after_data, notes, prev_hash, row_hash, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12)
     RETURNING *`,
    [
      entityType,
      entityId,
      action,
      userId,
      amount,
      referenceNo,
      beforeData ? JSON.stringify(beforeData) : null,
      afterData ? JSON.stringify(afterData) : null,
      notes,
      prevHash,
      rowHash,
      createdAt,
    ]
  );

  return insertResult.rows[0];
}

module.exports = {
  ensureJournalTable,
  createJournalEntry,
};
