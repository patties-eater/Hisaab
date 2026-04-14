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

If you are keeping Supabase in the browser for any future direct client work, use the Vite names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

For the current app, the frontend should still point to your backend API.

Run:

```bash
cd frontend
npm install
npm run dev
```

## Supabase Deployment

If you move PostgreSQL to Supabase:

1. Run the schema SQL in the Supabase SQL editor.
2. Update `NewBackend/.env` with the Supabase `DATABASE_URL`.
3. Keep the frontend pointed at the backend with `VITE_API_BASE_URL`.
4. Deploy backend and frontend separately.

## Release notes

- The frontend now uses a configurable API base URL instead of hard-coded localhost calls.
- Login and register screens are cleaned up for production use.
- Debt/credit and income/expense remain separate user flows, but they stay linked through accounting records and analytics.
