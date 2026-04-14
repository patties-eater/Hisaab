# Hisaab

Hisaab is a family and small-business finance tracker with:

- Income and expense tracking
- Debt and credit tracking with settlement handling
- Dashboard, audit, and analytics views
- Personal and shop account modes
- English and Nepali UI support

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL
- Auth: JWT
- Charts: Recharts

## Local setup

### Backend

Set these environment variables in `NewBackend/.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` optional, defaults to `5000`
- `ADMIN_USER_ID` optional for admin login
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` optional for admin login

Run:

```bash
cd NewBackend
npm install
npm run dev
```

### Frontend

Set `VITE_API_BASE_URL` if the backend is not running on `http://localhost:5000`.

Run:

```bash
cd frontend
npm install
npm run dev
```

## Release notes

- The frontend now uses a configurable API base URL instead of hard-coded localhost calls.
- Login and register screens are cleaned up for production use.
- Debt/credit and income/expense remain separate user flows, but they stay linked through accounting records and analytics.
