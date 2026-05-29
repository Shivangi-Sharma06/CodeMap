import type { NextFunction, Request, Response } from 'express';
import { parse } from 'cookie';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../types/index.js';

const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function getSessionToken(req: Request): string | null {
  const authHeader = req.header('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cookieHeader = req.header('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  for (const name of SESSION_COOKIE_NAMES) {
    if (cookies[name]) {
      return cookies[name];
    }
  }

  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = getSessionToken(req);
    if (!token) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires.getTime() <= Date.now()) {
      throw new ApiError('Session not found or expired', 'UNAUTHORIZED', 401);
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.userId, provider: 'github' },
      select: { access_token: true },
    });

    req.userId = session.userId;
    req.githubAccessToken = account?.access_token ?? null;
    next();
  } catch (error) {
    next(error);
  }
}
