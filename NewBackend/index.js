const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/modules/user/user.routes");
const authMiddleware = require("./src/middlewares/authMiddleware");
const adminMiddleware = require("./src/middlewares/adminMiddleware");
const transactionRoutes = require("./src/modules/transactions/transaction.routes");
const debtCreditRoutes = require("./src/modules/debtCredits/debtCredit.routes");
const dashboardRoutes = require("./src/modules/dashboard/dashboard.routes");
const peopleRoutes = require("./src/modules/people/people.routes");
const adminRoutes = require("./src/modules/admin/admin.routes");
const journalRoutes = require("./src/modules/journal/journal.routes");
const accountingJournalRoutes = require("./src/modules/accountingJournal/accountingJournal.routes");
const db = require("./src/config/db");
const { ensureOwnershipColumns } = require("./src/utils/ownership");
const { ensureJournalTable } = require("./src/utils/journal");
const { ensureAccountingJournalTables } = require("./src/utils/accountingJournal");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", authMiddleware, transactionRoutes);
app.use("/api/debt-credit", authMiddleware, debtCreditRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/people", authMiddleware, peopleRoutes);
app.use("/api/journal", authMiddleware, journalRoutes);
app.use("/api/accounting-journal", authMiddleware, accountingJournalRoutes);
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome user ${req.user.id} to the dashboard!` });
});

const PORT = process.env.PORT || 5000;

async function initializeDatabaseHelpers() {
  if (!db.hasDatabaseUrl) {
    console.warn(
      "DATABASE_URL is not set. Server will start, but database-backed routes will return errors until it is configured."
    );
    return;
  }

  try {
    await Promise.all([
      ensureOwnershipColumns(),
      ensureJournalTable(),
      ensureAccountingJournalTables(),
    ]);
    console.log("Database helpers initialized [OK]");
  } catch (err) {
    console.error("Failed to initialize database helpers:", err);
    console.warn(
      "Continuing startup so the web process can stay alive. Check DATABASE_URL and the database service connection."
    );
  }
}

initializeDatabaseHelpers().finally(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} OK`));
});
