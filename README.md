# CodeMap

CodeMap turns a public GitHub repository into a shareable Day-1 onboarding guide for new engineers.

It helps a new teammate answer the first questions that usually slow them down:

- What does this repository do?
- Where should I start reading?
- Which files matter first?
- How do I share a useful summary with someone else?

## Why This Exists

Most repositories are too large to understand quickly. CodeMap compresses that first day of exploration into a guided report built from the repository itself, so engineers can move from “what is this?” to “where do I begin?” much faster.

People would use CodeMap to:

- Onboard new engineers into a codebase faster.
- Generate a readable architecture summary from a public repo.
- Share a stable overview link with teammates, managers, or reviewers.
- Save time when evaluating unfamiliar open-source projects.

## What It Does

- Signs users in with GitHub.
- Accepts a public repository URL and analyzes the codebase.
- Uses AI to produce a Day-1 style guide with architecture notes and start-here files.
- Stores reports in PostgreSQL through Prisma.
- Lets users share completed reports through public share links.

## Tech Stack

### Web

- Next.js 15 App Router
- TypeScript
- Mantine v7 for UI
- NextAuth v5 for GitHub authentication
- Lucide React for icons

### API

- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL on Neon

### Integrations

- GitHub REST API v3 using the signed-in user's OAuth token
- Groq `llama-3.3-70b-versatile` through the OpenAI-compatible SDK

## Repository Layout

- `apps/web`: Next.js frontend, auth UI, dashboards, and report views
- `apps/api`: Express API, Prisma schema, background analysis services, and report persistence

## Local Setup

Node.js 20+ is required to install and run the app.

1. Create a Neon database and copy both pooled `DATABASE_URL` and direct `DIRECT_URL` into the env files.
2. Create a GitHub OAuth app with callback `http://localhost:3000/api/auth/callback/github`.
3. Create a Groq API key.
4. Copy the environment templates:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

5. Install dependencies:

```bash
npm install
```

6. Generate Prisma clients:

```bash
npm run prisma:generate
```

7. Apply database migrations:

```bash
npm run prisma:migrate
```

8. Start the app:

```bash
npm run dev
```

The web app runs at `http://localhost:3000`; the API runs at `http://localhost:4000`.

## Prisma Commands

`npm run prisma:generate` rebuilds the Prisma client from the schema. You run it when the schema changes so TypeScript and runtime code both know about the latest models, fields, and relations.

`npm run prisma:migrate` applies the schema changes to the database. You run it when you want the actual PostgreSQL tables and columns to match `schema.prisma`.

In short:

- `generate` updates the code Prisma uses inside the app.
- `migrate` updates the database structure itself.

## Notes

- The Express API validates Auth.js database sessions from the forwarded httpOnly cookie, and also accepts `Authorization: Bearer {sessionToken}` for non-browser callers.
- Public share URLs resolve through `GET /api/share/:shareToken` and do not require authentication.
- Analysis logs are written for every pipeline step in `AnalysisLog`; user events are written to `ActivityLog`.
- Prisma schema lives in `apps/api/prisma/schema.prisma`; both web auth and API use the generated Prisma client.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
```
