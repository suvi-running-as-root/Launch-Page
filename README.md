Amar Seva Sangam USA – Launch Page

A clean, modern launch website for Amar Seva Sangam USA, built to support donations and collect subscriber information with a nonprofit-friendly design.

FEATURES
- Light blue and beige pastel UI
- Donation section (ready for Zeffy integration)
- Email subscription form (name, email, interests)
- Admin-protected endpoints to view and export subscribers
- Fully responsive layout

TECH STACK
Frontend:
- React
- Vite
- Custom CSS

Backend:
- Node.js
- Express
- Local JSON storage (subscribers.json)

PROJECT STRUCTURE
amar-seva-usa/
- backend/
  - server.js
  - subscribers.json
  - package.json
- frontend/
  - index.html
  - package.json
  - .env
  - src/

GETTING STARTED

Install Dependencies

Backend:
cd backend
npm install

Frontend:
cd frontend
npm install

ENVIRONMENT VARIABLES

Frontend (.env):
VITE_API_URL=http://localhost:4000

Backend (PowerShell):
$env:ADMIN_USER="admin?maybe"
$env:ADMIN_PASS="QwErTyUiOp"
$env:ZEFFY_WEBHOOK_SECRET="replace-with-a-long-random-secret"

RUNNING THE PROJECT

Start Backend:
cd backend
npm run dev

Start Frontend:
cd frontend
npm run dev

SUBSCRIBER MANAGEMENT

POST Subscribe:
POST /api/subscribe
Saved in backend/subscribers.json

Admin View:
curl -u "admin?maybe:QwErTyUiOp" http://localhost:4000/api/subscribers

Admin Export CSV:
curl -u "admin?maybe:QwErTyUiOp" http://localhost:4000/api/subscribers.csv -o subscribers.csv

DONATION INTEGRATION

Add Zeffy link to frontend/.env:
VITE_ZEFFY_DONATE_URL=https://your-zeffy-form-url

CONCERT PAYMENT DASHBOARD

Open `https://your-domain/admin` to sign in to the private concert-payment
dashboard. The default credentials requested are `admin?maybe` / `QwErTyUiOp`.
Before production, set `ADMIN_USER` and `ADMIN_PASS` in the backend environment
instead of relying on defaults.

The dashboard includes confirmed-payment totals, a daily revenue chart, a
transaction list, and an Excel-compatible CSV export. Data is stored locally in
`backend/concert-payments.json`.

PAYMENT VERIFICATION

A checkout redirect cannot prove a charge completed, so the dashboard only adds
a transaction when it receives an authenticated server-to-server notification.
Set `ZEFFY_WEBHOOK_SECRET` and configure the available Zeffy integration (or an
automation connected to Zeffy) to `POST` to:

`https://your-api-domain/api/zeffy/webhook`

Send the secret as `X-Zeffy-Webhook-Secret` (or a Bearer token) and send JSON
with `id` (or `transactionId`), `amount`, `currency`, `status: "paid"`,
`name`, `email`, and optionally `paidAt`. Transaction IDs are deduplicated, so
retries are safe. If the Zeffy account has no webhook/automation option, an
organizer can add only already-confirmed Zeffy payments through the protected
`POST /api/admin/concert-payments` endpoint; no browser action is counted as a
payment.

PRODUCTION BUILD

Use one Node service: it serves the compiled React site and all `/api` routes.
Set these backend environment variables in the hosting dashboard:

`ADMIN_USER`, `ADMIN_PASS`, `ZEFFY_WEBHOOK_SECRET`, and
`CORS_ORIGIN=https://your-domain.example`.

Use this build command from the repository root:

`npm --prefix frontend ci && npm --prefix frontend run build && npm --prefix backend ci --omit=dev`

Use this start command:

`npm --prefix backend start`

The host must provide `PORT` automatically; the backend already respects it.
Do not set `VITE_API_URL` for this single-service deployment—the built site will
call the same domain's `/api` routes. Make sure the host provides persistent
storage for `backend/concert-payments.json` and `backend/subscribers.json`;
ephemeral server disks will erase those records on redeploy.

If the frontend is deployed separately as a static site, deploy the `frontend`
folder and redeploy after this change. It includes SPA rewrite rules for Netlify
and Vercel so a direct visit to `/admin` loads the React application rather than
returning a hosting-provider 404. For another static host, configure an
equivalent rewrite from `/*` to `/index.html` with HTTP status 200.

For local development, if port 4000 is occupied, either stop the existing
process or use port 4001 for both services:

PowerShell: `$env:PORT=4001; npm run dev` (in `backend`), then set
`VITE_API_URL=http://127.0.0.1:4001` in `frontend/.env`.

FUTURE ENHANCEMENTS
- Zeffy modal integration
- Admin dashboard
- Google Sheets sync
- Email marketing integration

