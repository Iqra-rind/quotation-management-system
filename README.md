# Vendor Management & Quotation System

A full-stack web application for managing vendors, creating quotation requests, collecting vendor responses, and comparing quotations side-by-side to identify the most cost-effective offer.

Built for the **Teyzix Core Internship (June Batch)** — Task FS-2.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Axios, Recharts, Lucide Icons |
| Backend | Node.js, Express 5 |
| Database | SQLite, via Node's built-in `node:sqlite` module (no native compilation required) |
| Authentication | JWT (jsonwebtoken) + bcryptjs password hashing |
| PDF Export | PDFKit |
| Validation | express-validator |

**Why this stack:** it requires zero external services (no database server to install, no cloud account to set up) while still being a genuine relational database with a proper schema, foreign keys, and indexes. Anyone can clone the repo and have it running in under a minute.

> **Node version requirement:** `node:sqlite` requires **Node.js 22.5 or later**. Check your version with `node -v`. If you're on an older version, install the latest LTS from [nodejs.org](https://nodejs.org).

---

## Project Structure

```
vendor-quotation-system/
├── server/                      # Backend API
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql       # Database schema (tables, indexes, constraints)
│   │   │   ├── connection.js    # Database connection setup
│   │   │   └── seed.js          # Sample data seeder (incl. demo login accounts)
│   │   ├── controllers/         # Business logic per resource (incl. auth)
│   │   ├── routes/               # Express route definitions
│   │   ├── middleware/           # Validation, auth/role checks & error handling
│   │   ├── utils/                # Shared helpers (activity logger, JWT signing)
│   │   └── index.js              # App entry point
│   └── package.json
│
├── client/                       # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/client.js         # Axios API wrapper (attaches JWT automatically)
│   │   ├── context/AuthContext.jsx  # Auth state, login/register/logout
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                 # Route-level pages (incl. Login/Register)
│   │   ├── tokens.css             # Design tokens (colors, type, spacing) — light & dark
│   │   ├── ui.css                 # Shared UI primitives (buttons, tables, forms)
│   │   └── App.jsx                # Routing
│   └── package.json
│
└── README.md
```

---

## Getting Started

### 1. Backend setup

```bash
cd server
npm install
cp .env.example .env   # then optionally edit JWT_SECRET — a working default is generated for you
npm run seed      # populates the database with sample vendors, requests, quotations, and 2 demo login accounts
npm run dev        # starts the API on http://localhost:5000
```

### 2. Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev        # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser. The frontend's dev server proxies all `/api` calls to the backend automatically, so no additional configuration is needed.

### Logging in

The whole app is behind authentication. The seed script creates two demo accounts so you can log in immediately:

| Role | Email | Password | Can do |
|---|---|---|---|
| **Admin** | `admin@vendorsys.com` | `admin123` | Everything — including deleting records and approving/rejecting quotations |
| **Member** | `member@vendorsys.com` | `member123` | View, create vendors/requests, submit quotation responses — **cannot** delete anything or approve/reject |

You can also register a new account from the Login page (a role selector is shown at sign-up purely for demo/evaluation convenience — in a real deployment, role changes would instead be an admin-only action).

### Resetting the database

The SQLite file lives at `server/src/db/vendor_quotation.db`. To reset to a clean state, delete that file and run `npm run seed` again.

---

## Features

### Vendor Management
- Add, view, update, and delete vendors
- Search by name, company, or email; filter by active/inactive status

### Quotation Management
- Create a quotation request and send it to one or more vendors in a single action
- Vendors submit their quotation response (amount + notes)
- Approve or reject submitted quotations
- Full quotation history per vendor

### Quotation Comparison
- Side-by-side comparison of all vendor responses to a request
- The lowest-priced, non-rejected quotation is automatically highlighted with a **"Best Value"** tag
- Rows sorted by amount so the most competitive offer is always easiest to spot

### Dashboard
- Total vendors, active/pending/approved/submitted quotation counts
- Status breakdown chart
- Recent activity feed (every create/update/delete/status-change is logged)

### Bonus: PDF Export
- Any submitted quotation can be exported as a clean, formatted PDF summary (vendor details, request info, amount, status, notes) via the download icon on the comparison page.

### Bonus: Authentication & Authorization
- JWT-based login/register; every API route except `/auth/*` requires a valid token.
- Two roles, enforced **both server-side (so it can't be bypassed) and in the UI**:
  - **Admin** — full access, including deleting vendors/requests/quotations and approving/rejecting submitted quotations.
  - **Member** — can view everything, add vendors, create requests, and submit quotation responses, but cannot delete records or approve/reject. The corresponding buttons are hidden in the UI and the API also rejects the request with `403` if attempted directly.
- Passwords are hashed with bcrypt; tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`).

### Bonus: Dark Mode
- Full dark theme (toggle in the sidebar), persisted per-browser and defaulting to the OS preference on first visit.

---

## Database Schema

The schema lives in [`server/src/db/schema.sql`](server/src/db/schema.sql). Summary:

**`users`** — authentication & authorization
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | |
| email | TEXT | UNIQUE |
| password_hash | TEXT | bcrypt hash, never the plain password |
| role | TEXT | `admin` \| `member` |
| created_at / updated_at | TEXT | |

**`vendors`**
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| vendor_name | TEXT | |
| company_name | TEXT | |
| email | TEXT | UNIQUE |
| contact_number | TEXT | |
| business_address | TEXT | |
| status | TEXT | `active` \| `inactive` |
| created_at / updated_at | TEXT | |

**`quotation_requests`** — the "ask" sent out to one or more vendors
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| title | TEXT | |
| description | TEXT | |
| created_at / updated_at | TEXT | |

**`quotations`** — one row per vendor's response to a request
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| quotation_request_id | INTEGER FK | → quotation_requests |
| vendor_id | INTEGER FK | → vendors |
| quotation_amount | REAL | NULL until submitted |
| submission_date | TEXT | NULL until submitted |
| status | TEXT | `pending` \| `submitted` \| `approved` \| `rejected` |
| notes | TEXT | |

**`activity_log`** — powers the dashboard's "Recent Activity" feed
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| entity_type | TEXT | `vendor` \| `quotation_request` \| `quotation` |
| entity_id | INTEGER | |
| action | TEXT | `created` \| `updated` \| `deleted` \| `status_changed` |
| description | TEXT | |
| created_at | TEXT | |

A request-to-vendor relationship is modeled as **one row per vendor per request** in `quotations`, with a `UNIQUE(quotation_request_id, vendor_id)` constraint — this is what allows the comparison view to simply query all rows for a given request and sort by amount.

---

## API Reference

Base URL: `/api`

All endpoints below **require** an `Authorization: Bearer <token>` header (obtained from `/auth/login` or `/auth/register`), except the `/auth` endpoints themselves. Endpoints marked **(admin only)** return `403` for a `member` token.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account `{ name, email, password, role? }` → `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Current user from the token |
| GET | `/vendors?search=&status=` | List/search/filter vendors |
| GET | `/vendors/:id` | Vendor detail + quotation history |
| POST | `/vendors` | Create vendor |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | **(admin only)** Delete vendor |
| GET | `/quotation-requests?search=&status=` | List/search/filter requests with response counts |
| GET | `/quotation-requests/:id` | Request detail + all vendor quotations (comparison) |
| POST | `/quotation-requests` | Create request, assign to vendors |
| PUT | `/quotation-requests/:id` | Update request |
| DELETE | `/quotation-requests/:id` | **(admin only)** Delete request |
| GET | `/quotations?status=` | List all quotations |
| GET | `/quotations/:id` | Quotation detail |
| PUT | `/quotations/:id/submit` | Vendor submits amount + notes |
| PUT | `/quotations/:id/status` | **(admin only)** Approve / reject / change status |
| DELETE | `/quotations/:id` | **(admin only)** Delete a quotation |
| GET | `/quotations/:id/pdf` | Download quotation as PDF |
| GET | `/dashboard` | Aggregated dashboard stats |

---

## Deployment

This app deploys like any standard Node + static-frontend project:

- **Backend:** any Node host that supports Node 22.5+ (Render, Railway, Fly.io, a VPS). Run `npm install && npm start` inside `server/`. Set a real `JWT_SECRET` environment variable on the host (don't reuse the local dev one) — see `server/.env.example`. Note: SQLite is file-based, so on platforms with ephemeral filesystems (e.g. most serverless platforms) use a host with persistent disk, or swap the schema over to a hosted Postgres if needed.
- **Frontend:** `npm run build` inside `client/` produces a static `dist/` folder deployable to Vercel, Netlify, or any static host. Set the API base URL via an environment variable or reverse proxy to point at your deployed backend.

---

## Screenshots

See the `/screenshots` folder for a walkthrough of the Dashboard, Vendors, Quotation Requests, and Comparison views.

> Note: these screenshots predate the Login/Register pages and Dark Mode toggle added later — worth re-capturing those two before final submission.
