import OpenAI from 'openai';
import { ApiError, type AnalysisResult, type RepoData } from '../types/index.js';

const SYSTEM_PROMPT =
  'You are a senior software engineer and technical writer. Analyze a GitHub repository and produce a structured onboarding document for a new engineer joining the team. Be specific and grounded in the actual code - not generic advice. Your entire response must be a single valid JSON object. No markdown, no code fences, no explanation, no preamble. Only the JSON object.';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseAnalysis(text: string): AnalysisResult {
  try {
    return JSON.parse(cleanJson(text)) as AnalysisResult;
  } catch {
    throw new ApiError(`Failed to parse Groq response as JSON: ${cleanJson(text).slice(0, 200)}`, 'AI_FAILED', 502);
  }
}

function buildUserPrompt(data: RepoData, retry = false): string {
  const retryInstruction = retry
    ? '\nPrevious response was not valid JSON. Respond only with one parseable JSON object and no markdown fences.\n'
    : '';

  return `Analyze this GitHub repository and return exactly this JSON structure:

{
  "summary": "2-3 sentence plain-English description of what this project does and who it is for",
  "techStack": ["array of detected technologies, frameworks, languages, databases, tools"],
  "architecture": "3-5 sentence description of codebase structure, folder organization, patterns used (MVC, microservices, monorepo, etc), and notable design decisions",
  "startHere": [
    { "file": "relative/path/to/file.ts", "reason": "why a new engineer should read this first" }
  ],
  "keyConceptsGlossary": [
    { "term": "project-specific term", "definition": "plain-English explanation" }
  ],
  "setupSteps": ["Step 1: ...", "Step 2: ..."],
  "firstWeekTasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
  "warnings": ["Gotcha or complexity hotspot 1", "Gotcha 2"],
  "repoHealth": {
    "hasTests": true,
    "hasCI": false,
    "hasDocumentation": true,
    "hasDependencyLock": true,
    "hasLicense": true
  }
}

Rules:
- startHere: exactly 4-6 files
- keyConceptsGlossary: exactly 4-8 terms
- setupSteps: realistic steps inferred from package.json, README, and file structure
- firstWeekTasks: exactly 4-5 items
- warnings: 2-4 items, skip if nothing notable
- repoHealth: boolean values based on presence of test files, .github/workflows, docs folder, lock files, LICENSE

Repository data:
Name: ${data.metadata.fullName}
Description: ${data.metadata.description ?? 'None'}
Primary Language: ${data.metadata.language ?? 'Unknown'}
Topics: ${data.metadata.topics.join(', ') || 'None'}
Stars: ${data.metadata.stars}
File tree: ${JSON.stringify(data.fileTree)}
README (truncated): ${data.readme ?? 'No README found'}
Key config files: ${JSON.stringify(data.keyFiles)}
${retryInstruction}`;
}

async function requestAnalysis(data: RepoData, retry = false): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(data, retry) },
    ],
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function analyzeRepository(data: RepoData): Promise<AnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError('Missing GROQ_API_KEY', 'AI_FAILED', 500);
  }

  const firstResponse = await requestAnalysis(data);

  try {
    return parseAnalysis(firstResponse);
  } catch {
    const retryResponse = await requestAnalysis(data, true);
    return parseAnalysis(retryResponse);
  }
}
