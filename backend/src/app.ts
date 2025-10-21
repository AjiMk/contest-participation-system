import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import contestsRoutes from './routes/contests';
import questionsRoutes from './routes/questions';
import participationRoutes from './routes/participation';
import { sequelize } from './config/database';

// Load environment variables preferably from project root .env, fallback to backend/.env
(() => {
  const rootEnv = path.resolve(__dirname, '../../.env');
  const backendEnv = path.resolve(__dirname, '../.env');
  const rootLoaded = dotenv.config({ path: rootEnv });
  if (!rootLoaded.parsed) {
    dotenv.config({ path: backendEnv });
  }
})();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Resource routes
app.use('/api/contests', contestsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/participation', participationRoutes);

// Routes
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: 'connected' });
  } catch (error: any) {
    res.status(500).json({ ok: false, db: 'unreachable', error: error?.message });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Attempt initial DB connection (non-fatal)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (err: any) {
    console.error('Database connection failed:', err?.message || err);
  }
})();

export default app;
