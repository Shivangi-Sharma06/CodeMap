export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

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

export type AnalysisLog = {
  id?: string;
  step: string;
  status: string;
  message: string | null;
  durationMs: number | null;
  createdAt?: string;
};

export type Report = {
  id: string;
  userId?: string;
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  repoFullName: string;
  repoStars: number;
  repoLanguage: string | null;
  repoTopics: string[];
  shareToken: string;
  isPublic: boolean;
  status: ReportStatus;
  result: AnalysisResult | null;
  errorMessage: string | null;
  processingMs: number | null;
  createdAt: string;
  updatedAt: string;
  logs?: AnalysisLog[];
};

export type StatusStep = {
  step: string;
  status: string;
  message: string | null;
  durationMs: number | null;
};

export type AnalyzeStatus = {
  reportId: string;
  status: ReportStatus;
  currentStep: string | null;
  errorMessage: string | null;
  steps: StatusStep[];
};
