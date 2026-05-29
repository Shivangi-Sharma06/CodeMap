import { Prisma, ReportStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { analyzeRepository } from './groq.service.js';
import {
  fetchFileTree,
  fetchKeyFiles,
  fetchReadme,
  fetchRepoMetadata,
  parseGitHubRepoUrl,
} from './github.service.js';
import {
  ANALYSIS_STEPS,
  ApiError,
  type AnalysisStep,
  type RequestMeta,
  type RepoData,
} from '../types/index.js';

type StartPipelineArgs = {
  reportId: string;
  repoUrl: string;
  userId: string;
  githubAccessToken: string;
};

export async function logActivity(
  userId: string,
  action: string,
  metadata: Prisma.InputJsonValue,
  meta: RequestMeta,
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      metadata,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });
}

async function logStep(reportId: string, step: AnalysisStep, status: string, message?: string, durationMs?: number) {
  await prisma.analysisLog.create({
    data: {
      reportId,
      step,
      status,
      message,
      durationMs,
    },
  });
}

async function runStep<T>(reportId: string, step: AnalysisStep, fn: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  await logStep(reportId, step, 'STARTED');

  try {
    const result = await fn();
    await logStep(reportId, step, 'COMPLETED', undefined, Date.now() - startedAt);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logStep(reportId, step, 'FAILED', message, Date.now() - startedAt);
    throw error;
  }
}

export async function createReportForAnalysis(userId: string, repoUrl: string) {
  const parsed = parseGitHubRepoUrl(repoUrl);

  return prisma.report.create({
    data: {
      userId,
      repoUrl: parsed.repoUrl,
      repoName: parsed.repo,
      repoOwner: parsed.owner,
      repoFullName: parsed.fullName,
      repoTopics: [],
      status: ReportStatus.PENDING,
    },
  });
}

export async function runAnalysisPipeline(args: StartPipelineArgs) {
  const pipelineStartedAt = Date.now();

  try {
    await prisma.report.update({
      where: { id: args.reportId },
      data: { status: ReportStatus.PROCESSING, errorMessage: null },
    });

    const parsed = await runStep(args.reportId, 'VALIDATE_URL', async () => parseGitHubRepoUrl(args.repoUrl));

    const metadata = await runStep(args.reportId, 'FETCH_METADATA', async () =>
      fetchRepoMetadata(parsed.owner, parsed.repo, args.githubAccessToken),
    );

    await prisma.report.update({
      where: { id: args.reportId },
      data: {
        repoName: metadata.name,
        repoOwner: metadata.owner,
        repoFullName: metadata.fullName,
        repoStars: metadata.stars,
        repoLanguage: metadata.language,
        repoTopics: metadata.topics,
      },
    });

    const fileTree = await runStep(args.reportId, 'FETCH_TREE', async () =>
      fetchFileTree(parsed.owner, parsed.repo, metadata.defaultBranch, args.githubAccessToken),
    );

    const readmeStartedAt = Date.now();
    await logStep(args.reportId, 'FETCH_README', 'STARTED');
    const readme = await fetchReadme(parsed.owner, parsed.repo, args.githubAccessToken);
    await logStep(
      args.reportId,
      'FETCH_README',
      readme ? 'COMPLETED' : 'NOT_FOUND',
      readme ? undefined : 'README not found',
      Date.now() - readmeStartedAt,
    );

    const keyFiles = await runStep(args.reportId, 'FETCH_KEY_FILES', async () =>
      fetchKeyFiles(parsed.owner, parsed.repo, metadata.defaultBranch),
    );

    const repoData: RepoData = { metadata, fileTree, readme, keyFiles };
    const analysis = await runStep(args.reportId, 'AI_ANALYSIS', async () => analyzeRepository(repoData));

    await runStep(args.reportId, 'SAVE_RESULT', async () => {
      await prisma.report.update({
        where: { id: args.reportId },
        data: {
          result: analysis as Prisma.InputJsonValue,
          status: ReportStatus.COMPLETED,
          processingMs: Date.now() - pipelineStartedAt,
        },
      });
    });
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(error instanceof Error ? error.message : 'Analysis failed', 'INTERNAL_ERROR', 500);

    await prisma.report.update({
      where: { id: args.reportId },
      data: {
        status: ReportStatus.FAILED,
        errorMessage: apiError.message,
        processingMs: Date.now() - pipelineStartedAt,
      },
    });

    logger.error('Analysis pipeline failed', {
      reportId: args.reportId,
      code: apiError.code,
      message: apiError.message,
    });
  }
}

export async function getStatusPayload(reportId: string, userId: string) {
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId },
    include: { logs: { orderBy: { createdAt: 'asc' } } },
  });

  if (!report) {
    throw new ApiError('Report not found', 'NOT_FOUND', 404);
  }

  const latestByStep = new Map<string, (typeof report.logs)[number]>();
  for (const log of report.logs) {
    latestByStep.set(log.step, log);
  }

  const steps = ANALYSIS_STEPS.map((step) => {
    const log = latestByStep.get(step);
    return {
      step,
      status: log?.status ?? 'PENDING',
      message: log?.message ?? null,
      durationMs: log?.durationMs ?? null,
    };
  });

  const currentStep =
    steps.find((step) => step.status === 'STARTED')?.step ??
    steps.find((step) => step.status === 'PENDING')?.step ??
    null;

  return {
    reportId: report.id,
    status: report.status,
    currentStep,
    errorMessage: report.errorMessage,
    steps,
  };
}
