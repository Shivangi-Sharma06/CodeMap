import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler } from './asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../types/index.js';
import { logActivity } from '../services/report.service.js';

export const reportsRouter = Router();

function getParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string') {
    throw new ApiError(`${name} is required`, 'BAD_REQUEST', 400);
  }

  return value;
}

reportsRouter.get(
  '/api/reports',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const reports = await prisma.report.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        repoUrl: true,
        repoName: true,
        repoOwner: true,
        repoFullName: true,
        repoStars: true,
        repoLanguage: true,
        repoTopics: true,
        shareToken: true,
        isPublic: true,
        status: true,
        errorMessage: true,
        processingMs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ reports });
  }),
);

reportsRouter.get(
  '/api/reports/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const id = getParam(req.params.id, 'id');
    const report = await prisma.report.findFirst({
      where: {
        id,
        OR: [{ userId: req.userId }, { isPublic: true }],
      },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });

    if (!report) {
      throw new ApiError('Report not found', 'NOT_FOUND', 404);
    }

    res.json({ report });
  }),
);

reportsRouter.delete(
  '/api/reports/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const id = getParam(req.params.id, 'id');
    const report = await prisma.report.findFirst({
      where: { id, userId: req.userId },
    });

    if (!report) {
      throw new ApiError('Report not found', 'NOT_FOUND', 404);
    }

    await prisma.report.delete({ where: { id: report.id } });
    await logActivity(req.userId, 'REPORT_DELETED', { reportId: report.id, repoFullName: report.repoFullName }, {
      ipAddress: req.ip,
      userAgent: req.header('user-agent'),
    });

    res.status(204).send();
  }),
);

reportsRouter.patch(
  '/api/reports/:id/share',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.userId) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const id = getParam(req.params.id, 'id');
    const report = await prisma.report.findFirst({
      where: { id, userId: req.userId },
    });

    if (!report) {
      throw new ApiError('Report not found', 'NOT_FOUND', 404);
    }

    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { isPublic: !report.isPublic },
    });

    await logActivity(
      req.userId,
      updated.isPublic ? 'REPORT_SHARED' : 'REPORT_UNSHARED',
      { reportId: updated.id, repoFullName: updated.repoFullName } satisfies Prisma.InputJsonObject,
      { ipAddress: req.ip, userAgent: req.header('user-agent') },
    );

    const publicOrigin = process.env.NEXTAUTH_URL ?? process.env.WEB_ORIGIN ?? 'http://localhost:3000';
    res.json({
      isPublic: updated.isPublic,
      shareUrl: `${publicOrigin}/share/${updated.shareToken}`,
    });
  }),
);

reportsRouter.get(
  '/api/share/:shareToken',
  asyncHandler(async (req, res) => {
    const shareToken = getParam(req.params.shareToken, 'shareToken');
    const report = await prisma.report.findFirst({
      where: { shareToken, isPublic: true },
      include: { logs: { orderBy: { createdAt: 'asc' } } },
    });

    if (!report) {
      throw new ApiError('Shared report not found', 'NOT_FOUND', 404);
    }

    res.json({ report });
  }),
);
