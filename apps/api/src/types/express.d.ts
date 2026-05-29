declare global {
  namespace Express {
    interface Request {
      userId?: string;
      githubAccessToken?: string | null;
    }
  }
}

export {};
