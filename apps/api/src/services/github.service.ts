import { ApiError, type KeyFile, type ParsedRepoUrl, type RepoMetadata } from '../types/index.js';

const GITHUB_API = 'https://api.github.com';
const IGNORED_SEGMENTS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '__pycache__',
  '.cache',
]);

const KEY_CONFIG_FILES = [
  'package.json',
  'Cargo.toml',
  'go.mod',
  'requirements.txt',
  'pyproject.toml',
  'pom.xml',
  'composer.json',
  'Gemfile',
];

export function parseGitHubRepoUrl(input: string): ParsedRepoUrl {
  const trimmed = input.trim();
  const match = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#].*)?$/i);

  if (!match) {
    throw new ApiError('Enter a valid GitHub repository URL', 'BAD_REQUEST', 400);
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '');
  return {
    owner,
    repo,
    repoUrl: `https://github.com/${owner}/${repo}`,
    fullName: `${owner}/${repo}`,
  };
}

function githubHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function fetchGitHubJson<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, { headers: githubHeaders(accessToken) });

  if (response.status === 404) {
    throw new ApiError("Repository not found or is private", 'REPO_NOT_FOUND', 404);
  }

  if (response.status === 403) {
    throw new ApiError('GitHub API rate limit reached. Try again in a few minutes.', 'RATE_LIMITED', 403);
  }

  if (!response.ok) {
    throw new ApiError(`GitHub request failed with status ${response.status}`, 'BAD_REQUEST', response.status);
  }

  return (await response.json()) as T;
}

type GitHubRepoResponse = {
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  default_branch: string;
  license: { spdx_id: string; name: string } | null;
  created_at: string;
  html_url: string;
};

type GitTreeResponse = {
  tree: Array<{ path?: string; type?: string }>;
};

type ReadmeResponse = {
  content: string;
  encoding: string;
};

export async function fetchRepoMetadata(owner: string, repo: string, accessToken: string): Promise<RepoMetadata> {
  const data = await fetchGitHubJson<GitHubRepoResponse>(`${GITHUB_API}/repos/${owner}/${repo}`, accessToken);

  return {
    name: data.name,
    fullName: data.full_name,
    owner: data.owner.login,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language,
    topics: data.topics ?? [],
    defaultBranch: data.default_branch,
    license: data.license?.spdx_id ?? data.license?.name ?? null,
    createdAt: data.created_at,
    htmlUrl: data.html_url,
  };
}

export async function fetchFileTree(owner: string, repo: string, branch: string, accessToken: string): Promise<string[]> {
  const data = await fetchGitHubJson<GitTreeResponse>(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    accessToken,
  );

  return data.tree
    .filter((item) => item.type === 'blob' && item.path)
    .map((item) => item.path as string)
    .filter((path) => !path.split('/').some((segment) => IGNORED_SEGMENTS.has(segment)))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 200);
}

export async function fetchReadme(owner: string, repo: string, accessToken: string): Promise<string | null> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
    headers: githubHeaders(accessToken),
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 403) {
    throw new ApiError('GitHub API rate limit reached. Try again in a few minutes.', 'RATE_LIMITED', 403);
  }

  if (!response.ok) {
    throw new ApiError(`README request failed with status ${response.status}`, 'BAD_REQUEST', response.status);
  }

  const data = (await response.json()) as ReadmeResponse;
  const decoded =
    data.encoding === 'base64'
      ? Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')
      : data.content;

  return decoded.slice(0, 6000);
}

export async function fetchKeyFiles(owner: string, repo: string, branch: string): Promise<KeyFile[]> {
  const found: KeyFile[] = [];

  for (const filename of KEY_CONFIG_FILES) {
    if (found.length >= 5) {
      break;
    }

    const response = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${filename}`,
    );

    if (response.ok) {
      found.push({ path: filename, content: (await response.text()).slice(0, 2000) });
    }
  }

  return found;
}
