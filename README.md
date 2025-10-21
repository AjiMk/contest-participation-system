# Contest Participation System

A full-stack application for managing contest participation and submissions, built with TypeScript, Express.js, and PostgreSQL.

## Tech Stack

### Backend
- TypeScript 5.2
- Node.js & Express.js
- PostgreSQL with Sequelize ORM
- Jest for testing
- ESLint for code quality


## Project Structure

```
contest-participation-system/
├── backend/
│   ├── src/
│   │   ├── config/              # Database and environment configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # API routes
│   │   ├── middlewares/        # Express middlewares
│   │   ├── services/           # Business logic
│   │   ├── types/             # TypeScript interfaces and types
│   │   ├── utils/             # Helper functions
│   │   └── app.ts             # Express application setup
│   ├── tests/                  # Test files
│   └── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 16 or higher
- PostgreSQL

### Running the App

1. Clone the repository:
   ```bash
   git clone https://github.com/AjiMk/contest-participation-system.git
   cd contest-participation-system
   ```

### Local Development Setup

Local development:

1. Prerequisites:
   - Node.js 16 or higher
   - PostgreSQL 14 or higher
   - npm or yarn

2. Backend: install dependencies:
   ```bash
   git clone https://github.com/AjiMk/contest-participation-system.git
   cd contest-participation-system/backend
   npm install
   ```

# Contest Participation System

A full-stack application for managing contest participation and submissions, built with TypeScript, Express.js, and PostgreSQL. This repository contains both the backend (API + migrations) and a frontend (Vite/React) app.

## Quick overview

- Backend: TypeScript + Node.js + Express + Sequelize (Postgres)
-- Frontend: Vite (React) — served during development with `npm run dev` in `frontend/`

## Repository layout

```
contest-participation-system/
├── backend/          # Express + TypeScript server, migrations, seeders
├── frontend/         # Vite frontend (React) — if present
└── README.md
```

## Prerequisites

- Node.js 16 or higher
- npm (or yarn)

## Environment files

Copy `backend/.env.example` to `.env` at the backend folder (or project root) and update values.

Common backend env vars (examples):

```
DB_HOST=db
DB_PORT=5432
DB_NAME=contest_db
DB_USER=postgres
DB_PASSWORD=yourpassword
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
```


## Backend — Local development

1. Install dependencies:

```powershell
cd backend
npm install
```

2. Create or copy env file:

```powershell
cp .env.example ../.env   # on Windows PowerShell: copy backend\.env.example ..\.env
# Or manually copy backend/.env.example to project root .env and edit values
```

3. Run database migrations:

```powershell
cd backend
npm run migrate
```

4. Start development server with hot reload:

```powershell
npm run dev
```

5. Build and run (production-like):

```powershell
npm run build
npm start
```

Useful backend scripts (run from `backend/`):

- `npm run dev` — development server (nodemon)
- `npm run build` — transpile TypeScript to `dist/`
- `npm start` — run `node dist/app.js`
- `npm run migrate` — run Sequelize migrations
- `npm run seed` — run Sequelize seeders

## Frontend — Local development

If a `frontend/` folder exists in the repo, it uses Vite (React) by default. Typical commands:

```powershell
cd frontend
npm install
npm run dev        # start Vite dev server (hot reload)
npm run build      # produce production build in dist/
npm run preview    # preview the production build locally
```

By default the frontend expects the backend API at `http://localhost:3000/api`. You can override this with a Vite env var (for example `.env` containing `VITE_API_URL=http://localhost:3000/api`).

## Running locally

The steps below cover installing dependencies, running migrations, and starting both services during development.

1. Install backend dependencies and create env file:

```powershell
cd backend
npm install
# copy backend/.env.example to backend/.env and edit values
```

2. Ensure Postgres is running locally and reachable using the values in `backend/.env`.

3. Run database migrations and seeders:

```powershell
cd backend
npm run migrate
npm run seed
```

4. Start the backend dev server:

```powershell
npm run dev
```

5. Start the frontend dev server (if `frontend/` exists):

```powershell
cd ../frontend
npm install
npm run dev
```

Local troubleshooting for module resolution errors

- If Node crashes on startup with `Error: Cannot find module '<pkg>'`:
   1. Confirm the package is listed under `dependencies` (not `devDependencies`) in `backend/package.json`.
   2. Reinstall dependencies:

```powershell
cd backend
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

   3. Ensure your build output is up to date and `dist/` exists:

```powershell
npm run build
node dist/app.js
```

   4. If you still see module errors, check if the require/import path in the compiled file (for example `dist/services/authService.js`) matches the package name and that it exists in `node_modules`.


## Database migrations & seeders

This project uses Sequelize migrations located in `backend/migrations` and seeders in `backend/seeders`.

- Run migrations: `npm run migrate` (from `backend/`)
- Run seeders: `npm run seed` (from `backend/`)

If you need to create a fresh DB (drop/recreate), do so via your Postgres client and then run migrations and seeders.

## Authentication (JWT)

The backend uses JWT for authentication. Key points:

- `JWT_SECRET` and `JWT_EXPIRES_IN` are configured via environment variables.
- Authentication middleware is in `backend/src/middlewares/auth.ts` and attaches `req.user` (typed) when a valid token is presented.
- Example auth endpoints:
  - `POST /api/auth/register` — accepts `{ email, password, firstName, lastName }`, returns `{ user, token, expiresAt }`.
  - `POST /api/auth/login` — accepts `{ email, password }`, returns `{ user, token, expiresAt }`.

Authorization header example (PowerShell / curl):

```powershell
$headers = @{ Authorization = "Bearer <YOUR_TOKEN>" }
Invoke-RestMethod -Uri "http://localhost:3000/api/contests" -Headers $headers -Method Get

# curl example (PowerShell):
curl -H "Authorization: Bearer <YOUR_TOKEN>" http://localhost:3000/api/contests
```

## API summary

High-level endpoints implemented in the backend (see files under `backend/src/routes`):

- `POST /api/auth/register`, `POST /api/auth/login` — auth
- `GET|POST|PATCH|DELETE /api/contests` — contest CRUD (ADMIN for write)
- `GET|POST|PATCH|DELETE /api/contests/:id/questions` — questions for contests (ADMIN for write)
- `POST /api/participation` — submit participation (authenticated users)

Role model (rough): `GUEST` (unauthenticated), `USER`, `VIP`, `ADMIN`. Role enforcement happens in middleware + controller logic.

## Troubleshooting

If Node reports `MODULE_NOT_FOUND` for a package, follow the local troubleshooting steps above. Make sure runtime deps are listed in `dependencies` and reinstall as necessary.

## Development tips

- Keep runtime-only dependencies (bcryptjs, pg, express, jsonwebtoken, etc.) under `dependencies` in `backend/package.json` so they're available in production images.
- Use transactions when doing multi-row inserts/updates (questions + options) — code in `backend/src/routes/questions.ts` demonstrates this.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Make changes and add tests
4. Run lint and typecheck:

```powershell
cd backend
npm run lint
npm run typecheck
```

5. Push and open a PR

## License

This project is licensed under the MIT License.

---

If you'd like, I can also add a short `frontend/README.md` and `backend/README.md` with service-specific commands and examples — say the word and I will add them.
