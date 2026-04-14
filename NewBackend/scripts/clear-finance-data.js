const pool = require("../src/config/db");

async function clearFinanceData() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM journal_lines");
    await client.query("DELETE FROM journal_vouchers");
    await client.query("DELETE FROM journal_entries");
    await client.query("DELETE FROM transactions");
    await client.query("DELETE FROM debt_credit");

    await client.query("COMMIT");
    console.log("Finance data cleared successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to clear finance data:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
    process.exit(process.exitCode || 0);
  }
}

clearFinanceData();
