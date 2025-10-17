import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import { sequelize } from './config/database';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

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
