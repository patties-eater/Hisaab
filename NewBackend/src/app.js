const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/user/user.routes");
const authMiddleware = require("./middlewares/authMiddleware");
const adminMiddleware = require("./middlewares/adminMiddleware");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const debtCreditRoutes = require("./modules/debtCredits/debtCredit.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const peopleRoutes = require("./modules/people/people.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const journalRoutes = require("./modules/journal/journal.routes");
const accountingJournalRoutes = require("./modules/accountingJournal/accountingJournal.routes");

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

app.get("/", (req, res) => {
  res.json({ message: "Hisaab API is running" });
});

module.exports = app;
