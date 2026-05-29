# CodeMap

CodeMap turns a public GitHub repository into a shareable Day-1 onboarding guide for new engineers.

## Stack

- Next.js 15 App Router, TypeScript, Mantine v7, NextAuth v5, Lucide React
- Express 5, TypeScript, Prisma, PostgreSQL on Neon
- GitHub REST API v3 using the signed-in user's OAuth token
- Groq `llama-3.3-70b-versatile` through the OpenAI-compatible SDK

## Local Setup

Node.js is required to install and run the app. This shell did not have `node`, `npm`, or `npx` available, so dependencies and migrations were not executed here.

1. Create a Neon database and copy both pooled `DATABASE_URL` and direct `DIRECT_URL`.
2. Create a GitHub OAuth app with callback `http://localhost:3000/api/auth/callback/github`.
3. Create a Groq API key.
4. Copy environment templates:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

5. Install dependencies and generate Prisma:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

6. Run both apps:

```bash
npm run dev
```

The web app runs at `http://localhost:3000`; the API runs at `http://localhost:4000`.

## Important Notes

- The Express API validates Auth.js database sessions from the forwarded httpOnly cookie, and also accepts `Authorization: Bearer {sessionToken}` for non-browser callers.
- Public share URLs resolve through `GET /api/share/:shareToken` and do not require authentication.
- Analysis logs are written for every pipeline step in `AnalysisLog`; user events are written to `ActivityLog`.
- Prisma schema lives in `apps/api/prisma/schema.prisma`; both web auth and API use the generated Prisma client.
