# Contest Participation System - Backend

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. For production: `npm start`

## Project Structure

```
backend/
├── src/
│   ├── config/              # DB connection, env setup
│   ├── controllers/         # Logic for routes
│   ├── models/             # Database models
│   ├── routes/             # Express routers
│   ├── middlewares/        # Auth, validation, error handlers
│   ├── services/           # Business logic
│   ├── utils/             # Helper utilities
│   └── app.js             # Main Express app
```

## API Documentation

[Add API documentation here]

## Docker

Build: `docker build -t contest-system-backend .`
Run: `docker-compose up`
