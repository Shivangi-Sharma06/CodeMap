import 'dotenv/config';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { healthRouter } from './routes/health.js';
import { reportsRouter } from './routes/reports.js';
import { analyzeRouter } from './routes/analyze.js';
import { rateLimit } from './middleware/rateLimit.js';
import { logger } from './lib/logger.js';
import { ApiError } from './types/index.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

app.use(
  cors({
    origin: webOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit);

app.use(healthRouter);
app.use(analyzeRouter);
app.use(reportsRouter);

app.use((_req, _res, next) => {
  next(new ApiError('Route not found', 'NOT_FOUND', 404));
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message, code: error.code });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  logger.error('Unhandled API error', { message });
  res.status(500).json({ error: 'Unexpected server error', code: 'INTERNAL_ERROR' });
};

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});
