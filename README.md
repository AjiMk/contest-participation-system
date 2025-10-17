# Contest Participation System

A full-stack application for managing contest participation and submissions, built with TypeScript, Express.js, and PostgreSQL.

## Tech Stack

### Backend
- TypeScript 5.2
- Node.js & Express.js
- PostgreSQL with Sequelize ORM
- Jest for testing
- ESLint for code quality
- Docker for containerization

## Recent Updates
- Added Docker configuration with multi-container setup
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
│   ├── Dockerfile             # Backend container configuration
│   └── package.json           # Dependencies and scripts
└── docker-compose.yml        # Multi-container orchestration
```

## Getting Started

### Prerequisites
- Node.js 16 or higher
- PostgreSQL
- Docker (optional)

### Running with Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Clone the repository:
   ```bash
   git clone https://github.com/AjiMk/contest-participation-system.git
   cd contest-participation-system
   ```

3. Start the application:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build and start the backend server (available at http://localhost:3000)
   - Start PostgreSQL database (available at localhost:5432)
   - Set up all required environment variables
   - Create persistent volume for database data

4. To stop the application:
   ```bash
   docker-compose down
   ```

### Local Development Setup

If you prefer to run the application without Docker:

1. Prerequisites:
   - Node.js 16 or higher
   - PostgreSQL 14 or higher
   - npm or yarn

2. Clone and install dependencies:
   ```bash
   git clone https://github.com/AjiMk/contest-participation-system.git
   cd contest-participation-system/backend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=contest_db
     DB_USER=postgres
     DB_PASSWORD=yourpassword
     NODE_ENV=development
     PORT=3000
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Migrations

This project uses Sequelize migrations. After configuring your `.env` and ensuring Postgres is running, run migrations from the `backend` folder:

```bash
cd backend
npx sequelize-cli db:migrate
# or
npm run migrate
```

If you are running the app via Docker Compose, the DB container must be up before running the migrations (or the backend container/migration step should be part of your compose setup).

### Token-based Authentication (JWT)

The backend includes JWT-based authentication utilities and middleware.

Environment variables (set in `backend/.env` or top-level `.env`):

```
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

Auth endpoints:

- `POST /api/auth/register` - body: `{ email, password, firstName, lastName }` — registers a user and returns `{ user, token }`.
- `POST /api/auth/login` - body: `{ email, password }` — returns `{ user, token }` on success.

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

[API documentation will be added here]

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
