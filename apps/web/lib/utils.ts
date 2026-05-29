export function isValidGitHubRepoUrl(value: string): boolean {
  return /^https?:\/\/(?:www\.)?github\.com\/[^/\s]+\/[^/\s#?]+(?:\.git)?(?:[/?#].*)?$/i.test(value.trim());
}

export function formatRelativeDate(value: string): string {
  const then = new Date(value).getTime();
  const diffSeconds = Math.max(1, Math.floor((Date.now() - then) / 1000));

  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} years ago`;
}

export function formatStepName(step: string): string {
  const names: Record<string, string> = {
    VALIDATE_URL: 'Validating repository URL',
    FETCH_METADATA: 'Fetching repository metadata',
    FETCH_TREE: 'Reading file structure',
    FETCH_README: 'Reading README',
    FETCH_KEY_FILES: 'Finding key config files',
    AI_ANALYSIS: 'Analyzing codebase with AI',
    SAVE_RESULT: 'Saving report',
  };

  return names[step] ?? step;
}
