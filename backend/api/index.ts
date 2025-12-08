import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from '../src/routes/auth';
import expensesRoutes from '../src/routes/expenses';
import recurringRoutes from '../src/routes/recurring';
import budgetRoutes from '../src/routes/budget';

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list or if we allow all origins
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes - no /api prefix needed since file is already at /api/index.ts
app.use('/auth', authRoutes);
app.use('/expenses', expensesRoutes);
app.use('/recurring', recurringRoutes);
app.use('/budget', budgetRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budgify API is running' });
});

// Export the Express app for Vercel
export default app;
