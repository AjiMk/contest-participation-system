# Contest Participation System

A full-stack application for managing contest participation and submissions, built with TypeScript, Express.js, and PostgreSQL.

## Tech Stack

### Backend
- TypeScript 5.2
- Node.js & Express.js
- PostgreSQL with Sequelize ORM
- Jest for testing
- ESLint for code quality

## Recent Updates
- Implemented basic Express server with health checks
- Set up PostgreSQL database connection with Sequelize ORM
- Added User model with TypeScript interfaces
- Implemented error handling middleware
- Added environment variable type definitions
- Set up TypeScript configuration for the project

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

3. Environment variables (root-level `.env`):
   - Copy `backend/.env.example` to a new file at the project root named `.env`
   - Update the following variables in `.env`:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=contest_db
     DB_USER=postgres
     DB_PASSWORD=yourpassword
     NODE_ENV=development
     PORT=3000
     JWT_SECRET=your-secret-key
     JWT_EXPIRES_IN=30d
     ```

4. Start the backend development server (from `backend/`):
   ```bash
   npm run dev
   ```

5. Frontend: in a second terminal, install and start Vite dev server:
   ```bash
   cd ../frontend
   npm install
   # Optional: override API base (defaults to http://localhost:3000/api)
   # echo VITE_API_URL=http://localhost:3000/api > .env
   npm run dev
   ```
   - Open the URL printed by Vite (typically http://localhost:5173).
   - The frontend will call the backend at `VITE_API_URL`.

### Database Migrations

This project uses Sequelize migrations. After configuring your `.env` and ensuring Postgres is running, run migrations from the `backend` folder:

```bash
cd backend
npx sequelize-cli db:migrate
# or
npm run migrate
```

Ensure your PostgreSQL instance is running before migrations.

### Token-based Authentication (JWT)

The backend includes JWT-based authentication utilities and middleware.

Environment variables (prefer root `.env`, backend `.env` as fallback):

```
JWT_SECRET=your-secret-key
# Default is 30d if unset; override as needed (e.g., 12h, 7d)
JWT_EXPIRES_IN=30d
```

Auth endpoints:

- `POST /api/auth/register` - body: `{ email, password, firstName, lastName }` — registers a user and returns `{ user, token, expiresAt }`.
- `POST /api/auth/login` - body: `{ email, password }` — returns `{ user, token, expiresAt }` on success.

Frontend stores the token in a cookie (`cps_token`) whose expiry matches `expiresAt`.

Protect routes using the `requireAuth` middleware located at `backend/src/middlewares/auth.ts`. It expects an `Authorization: Bearer <token>` header and attaches the token payload to `req.user`.


### Available Scripts

Backend scripts available in the `backend` directory:
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript code to JavaScript
- `npm start`: Run production server
- `npm run typecheck`: Check TypeScript types
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `npm test`: Run Jest tests
- `npm run migrate`: Run database migrations
- `npm run seed`: Run database seeders

### Verifying the Setup

1. Check if the server is running:
   ```
   GET http://localhost:3000/health
   ```

2. Check database connection:
   ```
   GET http://localhost:3000/health/db
   ```

## API Documentation

Below are the primary backend API endpoints added for contests, questions, and participation along with the required roles and example requests.

### Endpoints

- GET /api/contests
   - Description: List contests. Results should be filtered by contest visibility (NORMAL / VIP) depending on the caller's role.
   - Roles: Guests (unauthenticated) may access public contest listings if the route allows `GUEST`; authenticated users see contests based on their role (USER → NORMAL, VIP → NORMAL+VIP, ADMIN → all).
   - Example: `GET /api/contests` (use Authorization header to see private results)

- POST /api/contests
   - Description: Create a new contest.
   - Roles: ADMIN only

- GET /api/contests/:id
   - Description: Get contest details. Service layer should enforce visibility rules (e.g., VIP-only contests).
   - Roles: Depends on contest visibility. PUBLIC/GUEST allowed when contest is public.

- PUT /api/contests/:id
   - Description: Update contest
   - Roles: ADMIN only

- DELETE /api/contests/:id
   - Description: Delete contest
   - Roles: ADMIN only

- GET /api/questions
   - Description: List questions (should be filtered by contest and visibility).
   - Roles: Guest allowed if the contest/questions are public; otherwise USER/VIP/ADMIN as applicable.

- POST /api/questions
   - Description: Create a question for a contest
   - Roles: ADMIN only

- PUT /api/questions/:id
   - Description: Update a question
   - Roles: ADMIN only

- DELETE /api/questions/:id
   - Description: Delete a question
   - Roles: ADMIN only

- POST /api/participation
   - Description: Submit participation/entry for a contest
   - Roles: Authenticated users (USER, VIP, ADMIN)

- GET /api/participation
   - Description: List participations. Admins can see all; users see their own; VIPs may have elevated viewing as appropriate.
   - Roles: USER, VIP, ADMIN

### Authorization header example

All protected endpoints expect an Authorization header with a Bearer token. The token is the JWT returned by the login/register endpoints.

Header format:

```
Authorization: Bearer <JWT_TOKEN>
```

Examples

- curl (Windows / PowerShell):

   ```bash
   curl -H "Authorization: Bearer <YOUR_TOKEN>" http://localhost:3000/api/contests
   ```

- PowerShell Invoke-RestMethod:

   ```powershell
   $headers = @{ Authorization = "Bearer <YOUR_TOKEN>" }
   Invoke-RestMethod -Uri "http://localhost:3000/api/contests" -Headers $headers -Method Get
   ```

- fetch (browser/node):

   ```js
   fetch('/api/contests', { headers: { Authorization: `Bearer ${token}` } })
   ```

- axios:

   ```js
   axios.get('/api/contests', { headers: { Authorization: `Bearer ${token}` } })
   ```

### Notes on role enforcement

- Guests: can access endpoints that explicitly allow `GUEST` (e.g., public GET /api/contests).
- USER: can access NORMAL contests and submit participations.
- VIP: can access NORMAL and VIP contests.
- ADMIN: full CRUD across contests and questions, and full visibility into participations.

The middleware in `backend/src/middlewares` implements coarse access control. Fine-grained access to a particular contest (for example, checking that a user may join a VIP contest) should be implemented in the service/controller layer where the contest visibility and ownership are enforced.


## Development Guidelines

### TypeScript Conventions
- Use strict type checking
- Avoid using `any` type
- Use interfaces for object shapes
- Use enums for fixed values
- Document complex types

### Code Style
- Use ESLint rules
- Write unit tests for new features
- Follow REST API conventions
- Use async/await for asynchronous code

### Git Workflow
1. Create feature branch from main
2. Make changes and write tests
3. Run linting and type checking
4. Create pull request
5. Wait for review and merge

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

AjiMk - [GitHub Profile](https://github.com/AjiMk)

Project Link: [https://github.com/AjiMk/contest-participation-system](https://github.com/AjiMk/contest-participation-system)" 
