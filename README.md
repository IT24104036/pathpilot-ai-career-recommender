# PathPilot

PathPilot is an AI-assisted career recommendation platform for IT students and early-career
graduates. Users answer a short assessment, receive ranked tech career matches, and can create an
account to save their result history and track progress from a personal dashboard.

## Tech Stack

| Layer      | Technology                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, TanStack Start/Router, Tailwind CSS v4, shadcn/ui-style components, Recharts |
| Backend    | Node.js, Express 5, MongoDB, Mongoose                                                              |
| Auth       | JWT, bcrypt password hashing, role-based user/admin access                                         |
| ML service | FastAPI, scikit-learn, pandas, joblib                                                              |
| Tooling    | Vite, ESLint, Prettier, concurrently                                                               |

## Features

- Guest career assessment with a real result page.
- ML-first career prediction through the FastAPI service.
- Mock recommendation fallback only when the ML service is unavailable.
- Clear result source tracking: `source: "ml"` or `source: "mock"`.
- Registered user accounts with saved assessment history.
- User dashboard with career matches, profile, and progress tracking.
- Admin MVP dashboard with total users, total assessments, most recommended career, average score,
  and recent assessments.

## User Flows

### Guest Flow

1. Open the site and start the assessment.
2. Submit answers without creating an account.
3. View ranked career recommendations on `/results`.
4. Use the `Create Free Account` or `Sign In` CTA to save the result later.

### Logged-In User Flow

1. Register or sign in.
2. Take or retake the assessment.
3. The backend saves the assessment with the authenticated `userId`.
4. The results page shows `Saved to your account` and links to the dashboard/profile.
5. Saved results are available from the dashboard.

### Admin Flow

1. Seed an admin account from the backend.
2. Sign in at `/admin/login`.
3. Open `/admin/dashboard`.
4. The dashboard reads real backend data from MongoDB.

This is intentionally an MVP admin surface. Full users and assessments management pages are not
included yet; the backend already exposes simple admin endpoints for users, assessments, and
summary data.

## ML Pipeline Summary

The ML work lives in `ml-service/`.

- `dataset/career_dataset.csv` contains the training/reference dataset.
- `ml-service/ENCODING_SPEC.md` documents the expected frontend answer values.
- Training and utility scripts are in `ml-service/*.py`.
- Trained model artifacts are stored in `ml-service/model/*.pkl` for the demo.
- `ml-service/app.py` exposes FastAPI endpoints:
  - `GET /health`
  - `POST /predict`
- The backend `/api/assess` route calls `http://localhost:8000/predict` first.
- If the ML service is down, the backend logs the ML error and uses the deterministic mock fallback.

Do not retrain the model or regenerate the dataset for normal MVP demo use.

## Project Structure

```text
career-compass-ai/
├── frontend/        # React + TanStack Start frontend
├── backend/         # Express API, auth, assessment persistence, admin endpoints
├── ml-service/      # FastAPI ML service and model artifacts
├── dataset/         # Career dataset used by the ML pipeline
├── package.json     # Root convenience scripts
├── README.md
└── .gitignore
```

## Environment Variables

Create local env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`

```env
MONGO_URI=<your MongoDB connection string>
PORT=5000
JWT_SECRET=<long random secret>
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8082,http://127.0.0.1:8082
ML_SERVICE_URL=http://localhost:8000
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

Never commit real `.env` files.

## Deploy frontend on Vercel

The frontend is **TanStack Start (SSR)**, not a plain static React app. It needs Nitro’s
Vercel preset so the server can render HTML. A static-only deploy produces a **blank white page**
because there is no client `index.html` without SSR.

### 1. Code is already prepared

- `frontend/vite.config.ts` enables `nitro: { preset: "vercel" }`
- `frontend/vercel.json` sets the framework to `tanstack-start`

### 2. Create the Vercel project

1. Import the Git repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend` (critical for this monorepo).
3. Framework Preset: **TanStack Start** (or leave auto-detect with `vercel.json`).
4. Build command: `npm run build` (default).
5. Install command: `npm install` (default).
6. Do **not** set Output Directory manually — Nitro/Vercel handle it.

### 3. Environment variable on Vercel

In Project → Settings → Environment Variables, add:

| Name           | Value                                      | Environments   |
| -------------- | ------------------------------------------ | -------------- |
| `VITE_API_URL` | `https://your-backend.example.com` (no `/`) | Production, Preview |

`VITE_*` vars are baked in at **build** time. After changing them, **redeploy**.

### 4. Backend CORS (required or login/API will fail)

On your hosted backend, set `CLIENT_ORIGIN` (or `FRONTEND_URL`) to your Vercel URL(s):

```env
CLIENT_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
ML_SERVICE_URL=https://your-ml-service.example.com
```

Redeploy the backend after updating CORS.

### 5. Redeploy

Push to Git or click **Redeploy** in Vercel. Open the deployment URL — you should see the
landing page, not a blank screen.

## Install

Install root tooling and workspace dependencies:

```bash
npm install
npm run install-all
pip install -r ml-service/requirements.txt
```

## Run Locally

Run all three services:

```bash
npm run dev:all
```

Or run them separately:

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:ml
```

Default local URLs:

- Frontend: Vite will print the local URL, usually `http://localhost:5173`
- Backend API: `http://localhost:5000`
- ML service: `http://localhost:8000`
- ML health check: `http://localhost:8000/health`

## Admin Demo Account

The seed script creates a local demo admin account:

```bash
cd backend
npm run seed:admin
```

Default local demo credentials:

```text
Email: admin@pathpilot.ai
Password: Admin123
```

These are demo credentials only. Change them before any public deployment.

## Useful Checks

```bash
npm run typecheck:frontend
npm run lint:frontend
npm run build:frontend
node --check backend/server.js
```

Backend admin endpoints:

```text
GET /api/admin/summary
GET /api/admin/users
GET /api/admin/assessments
```

All admin endpoints require a JWT for a user with `role: "admin"`.
