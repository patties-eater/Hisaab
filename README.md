# Hisaab

**Hisaab** is a Family Finance Tracker built with **React** (frontend) and **Rust + Axum** (backend), powered by **PostgreSQL**.  

It helps families and small groups to:

- Track **income** and **expenses**
- Manage **debts** and **credits** with interest calculation
- View **dashboards** and **reports**
- Prepare for future multi-user SaaS deployment
- Support **Nepali language** (future upgrade)

---

## 💡 Features

- Record **income** and **expenses**  
- Show **current balance**  
- Track **debts and credits**, with automatic **interest calculation**  
- Detailed **transaction history**  
- Dashboard with charts (Income vs Expense, Category breakdown)  
- Multi-language ready (English + Nepali)  
- Future-proof structure for **multi-user organizations**

---

## 🏗 Project Structure
hisaab/
├── backend/ # Rust + Axum backend
├── frontend/ # React + Tailwind frontend
├── README.md
└── LICENSE


- **backend/** → Handles all financial logic, DB connection, and APIs  
- **frontend/** → React app with dashboard, forms, and charts  
- **i18n/** → Language files for future Nepali support  

---

## ⚙️ Tech Stack

- **Frontend:** React, Tailwind CSS, Vite, react-i18next, Axios  
- **Backend:** Rust, Axum, SQLx, PostgreSQL, JWT Auth  
- **Database:** PostgreSQL (local development / Supabase deployment)  
- **Charts:** Recharts  

---

## 🚀 Getting Started (Development)

### Prerequisites

- Node.js (v18+)
- Rust (stable)
- PostgreSQL (local)
- Cargo

