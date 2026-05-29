import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../types/index.js';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 80;

export function rateLimit(req: Request, _res: Response, next: NextFunction) {
  const key = req.ip ?? 'unknown';
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS) {
    next(new ApiError('Too many requests. Try again shortly.', 'RATE_LIMITED', 429));
    return;
  }

  next();
}
