export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'REPO_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'AI_FAILED'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export type ParsedRepoUrl = {
  owner: string;
  repo: string;
  repoUrl: string;
  fullName: string;
};

export type RepoMetadata = {
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  license: string | null;
  createdAt: string;
  htmlUrl: string;
};

export type KeyFile = {
  path: string;
  content: string;
};

export type RepoData = {
  metadata: RepoMetadata;
  fileTree: string[];
  readme: string | null;
  keyFiles: KeyFile[];
};

export type AnalysisResult = {
  summary: string;
  techStack: string[];
  architecture: string;
  startHere: Array<{ file: string; reason: string }>;
  keyConceptsGlossary: Array<{ term: string; definition: string }>;
  setupSteps: string[];
  firstWeekTasks: string[];
  warnings?: string[];
  repoHealth: {
    hasTests: boolean;
    hasCI: boolean;
    hasDocumentation: boolean;
    hasDependencyLock: boolean;
    hasLicense: boolean;
  };
};

export type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

export const ANALYSIS_STEPS = [
  'VALIDATE_URL',
  'FETCH_METADATA',
  'FETCH_TREE',
  'FETCH_README',
  'FETCH_KEY_FILES',
  'AI_ANALYSIS',
  'SAVE_RESULT',
] as const;

export type AnalysisStep = (typeof ANALYSIS_STEPS)[number];
