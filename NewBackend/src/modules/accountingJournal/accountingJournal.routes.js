const express = require("express");
const pool = require("../../config/db");
const { getAuthenticatedAccountMode, getAuthenticatedUserId } = require("../../utils/ownership");

const router = express.Router();

async function fetchVoucherLines(userId, accountMode, accountNameFilter = null) {
  const params = [userId, accountMode];
  let accountFilterSql = "";

  if (accountNameFilter) {
    params.push(accountNameFilter);
    accountFilterSql = " AND LOWER(jl.account_name) = LOWER($3)";
  }

  const result = await pool.query(
    `SELECT
       jv.id AS voucher_id,
       jv.date,
       jv.reference_no,
       jv.description,
       jv.source_type,
       jv.source_id,
       jv.created_at AS voucher_created_at,
       jl.id AS line_id,
       jl.account_name,
       jl.account_type,
       jl.debit,
       jl.credit,
       jl.notes
     FROM journal_lines jl
     INNER JOIN journal_vouchers jv ON jv.id = jl.voucher_id
     WHERE jv.user_id = $1
       AND jv.account_mode = $2
       ${accountFilterSql}
     ORDER BY jv.date ASC, jv.created_at ASC, jl.id ASC`,
    params
  );

  return result.rows;
}

function buildVoucherResponse(vouchers, lines) {
  const linesByVoucherId = lines.reduce((acc, line) => {
    acc[line.voucher_id] = acc[line.voucher_id] || [];
    acc[line.voucher_id].push(line);
    return acc;
  }, {});

  return vouchers.map((voucher) => ({
    ...voucher,
    lines: linesByVoucherId[voucher.id] || [],
  }));
}

function buildLedgerAccounts(lines) {
  const accounts = new Map();

  for (const line of lines) {
    const key = `${line.account_name}__${line.account_type}`;
    const current = accounts.get(key) || {
      accountName: line.account_name,
      accountType: line.account_type,
      totalDebit: 0,
      totalCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
      entries: [],
    };

    current.totalDebit += Number(line.debit);
    current.totalCredit += Number(line.credit);

    const runningDebit = Math.max(current.totalDebit - current.totalCredit, 0);
    const runningCredit = Math.max(current.totalCredit - current.totalDebit, 0);

    current.entries.push({
      id: line.line_id,
      voucherId: line.voucher_id,
      date: line.date,
      referenceNo: line.reference_no,
      description: line.description,
      sourceType: line.source_type,
      debit: Number(line.debit),
      credit: Number(line.credit),
      notes: line.notes,
      runningDebit,
      runningCredit,
    });

    current.closingDebit = runningDebit;
    current.closingCredit = runningCredit;

    accounts.set(key, current);
  }

  return Array.from(accounts.values()).sort((a, b) =>
    a.accountName.localeCompare(b.accountName)
  );
}

function buildTrialBalance(accounts) {
  return accounts.map((account) => ({
    accountName: account.accountName,
    accountType: account.accountType,
    totalDebit: Number(account.totalDebit.toFixed(2)),
    totalCredit: Number(account.totalCredit.toFixed(2)),
    closingDebit: Number(account.closingDebit.toFixed(2)),
    closingCredit: Number(account.closingCredit.toFixed(2)),
  }));
}

router.get("/", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const voucherResult = await pool.query(
      `SELECT *
       FROM journal_vouchers
       WHERE user_id = $1 AND account_mode = $2
       ORDER BY date DESC, created_at DESC
       LIMIT 200`,
      [userId, accountMode]
    );

    const lineResult = await pool.query(
      `SELECT jl.*, jv.user_id
       FROM journal_lines jl
       INNER JOIN journal_vouchers jv ON jv.id = jl.voucher_id
       WHERE jv.user_id = $1 AND jv.account_mode = $2
       ORDER BY jv.date DESC, jv.created_at DESC, jl.id ASC`,
      [userId, accountMode]
    );

    const data = buildVoucherResponse(voucherResult.rows, lineResult.rows);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching accounting journal:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/ledger", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const lines = await fetchVoucherLines(userId, accountMode);
    const accounts = buildLedgerAccounts(lines);

    res.json({
      success: true,
      data: {
        accounts,
        summary: {
          totalAccounts: accounts.length,
          totalDebit: Number(
            accounts.reduce((sum, account) => sum + account.totalDebit, 0).toFixed(2)
          ),
          totalCredit: Number(
            accounts.reduce((sum, account) => sum + account.totalCredit, 0).toFixed(2)
          ),
        },
      },
    });
  } catch (err) {
    console.error("Error fetching ledger:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/cash-book", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const lines = await fetchVoucherLines(userId, accountMode, "Cash");
    const accounts = buildLedgerAccounts(lines);
    const cashAccount = accounts[0] || {
      accountName: "Cash",
      accountType: "Asset",
      totalDebit: 0,
      totalCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
      entries: [],
    };

    res.json({
      success: true,
      data: {
        ...cashAccount,
        totalReceipts: Number(cashAccount.totalDebit.toFixed(2)),
        totalPayments: Number(cashAccount.totalCredit.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("Error fetching cash book:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/bank-book", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const lines = await pool.query(
      `SELECT
         jv.id AS voucher_id,
         jv.date,
         jv.reference_no,
         jv.description,
         jv.source_type,
         jv.source_id,
         jv.created_at AS voucher_created_at,
         jl.id AS line_id,
         jl.account_name,
         jl.account_type,
         jl.debit,
         jl.credit,
         jl.notes
       FROM journal_lines jl
       INNER JOIN journal_vouchers jv ON jv.id = jl.voucher_id
       WHERE jv.user_id = $1
         AND jv.account_mode = $2
         AND LOWER(jl.account_name) LIKE '%bank%'
       ORDER BY jv.date ASC, jv.created_at ASC, jl.id ASC`,
      [userId, accountMode]
    );
    const accounts = buildLedgerAccounts(lines.rows);

    res.json({
      success: true,
      data: {
        accounts,
        totalReceipts: Number(
          accounts.reduce((sum, account) => sum + account.totalDebit, 0).toFixed(2)
        ),
        totalPayments: Number(
          accounts.reduce((sum, account) => sum + account.totalCredit, 0).toFixed(2)
        ),
      },
    });
  } catch (err) {
    console.error("Error fetching bank book:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/trial-balance", async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const accountMode = getAuthenticatedAccountMode(req);
    const lines = await fetchVoucherLines(userId, accountMode);
    const accounts = buildLedgerAccounts(lines);
    const trialBalance = buildTrialBalance(accounts);

    res.json({
      success: true,
      data: {
        accounts: trialBalance,
        totals: {
          closingDebit: Number(
            trialBalance.reduce((sum, account) => sum + account.closingDebit, 0).toFixed(2)
          ),
          closingCredit: Number(
            trialBalance.reduce((sum, account) => sum + account.closingCredit, 0).toFixed(2)
          ),
        },
      },
    });
  } catch (err) {
    console.error("Error fetching trial balance:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
