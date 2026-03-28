import express, { Request, Response } from 'express';
import cors from 'cors';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

import institutionsRouter from './modules/institutions/institutions.router';
import resourcesRouter from './modules/resources/resources.router';
import requestsRouter from './modules/requests/requests.router';
import contributeRouter from './modules/contribute/contribute.router';
import adminRouter from './modules/admin/admin.router';
import statsRouter from './modules/stats/stats.router';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') ?? []
      : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply global rate limiter (per-route limiters are applied on specific routes)
app.use(generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'NotesWebsite API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/institutions', institutionsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/contribute', contributeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'The requested endpoint does not exist.',
    code: 'NOT_FOUND',
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

export default app;
