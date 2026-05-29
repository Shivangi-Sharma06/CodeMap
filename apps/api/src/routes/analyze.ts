import { Router } from 'express';
import { asyncHandler } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  createReportForAnalysis,
  getStatusPayload,
  logActivity,
  runAnalysisPipeline,
} from '../services/report.service.js';
import { ApiError } from '../types/index.js';

export const analyzeRouter = Router();

function getParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string') {
    throw new ApiError(`${name} is required`, 'BAD_REQUEST', 400);
  }

  return value;
}

analyzeRouter.post(
  '/api/analyze',
  requireAuth,
  asyncHandler(async (req, res) => {
    const repoUrl = typeof req.body?.repoUrl === 'string' ? req.body.repoUrl : '';
    if (!repoUrl) {
      throw new ApiError('Repository URL is required', 'BAD_REQUEST', 400);
    }

    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    if (!req.githubAccessToken) {
      throw new ApiError('GitHub access token unavailable. Sign in with GitHub again.', 'UNAUTHORIZED', 401);
    }

    const report = await createReportForAnalysis(req.userId, repoUrl);
    await logActivity(req.userId, 'REPORT_CREATED', { repoUrl: report.repoUrl }, {
      ipAddress: req.ip,
      userAgent: req.header('user-agent'),
    });

    void runAnalysisPipeline({
      reportId: report.id,
      repoUrl: report.repoUrl,
      userId: req.userId,
      githubAccessToken: req.githubAccessToken,
    });

    res.status(202).json({ reportId: report.id });
  }),
);

analyzeRouter.get(
  '/api/analyze/:reportId/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const reportId = getParam(req.params.reportId, 'reportId');
    const payload = await getStatusPayload(reportId, req.userId);
    res.json(payload);
  }),
);
