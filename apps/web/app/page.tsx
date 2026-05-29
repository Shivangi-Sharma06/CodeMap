import { Badge, Box, Button, Card, Divider, Grid, GridCol, Group, Stack, Text, Title } from '@mantine/core';
import { Github } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  async function signInWithGitHub() {
    'use server';
    await signIn('github', { redirectTo: '/dashboard' });
  }

  return (
    <Box mih="100vh" bg="dark.9" px={{ base: 'lg', md: 64 }} py={{ base: 40, md: 72 }}>
      <Grid align="center" gutter={{ base: 48, md: 72 }} mih="calc(100vh - 144px)">
        <GridCol span={{ base: 12, md: 6 }}>
          <Stack gap="xl" maw={620}>
            <Text ff="monospace" c="dark.2" size="sm" style={{ letterSpacing: 3 }}>
              CODEMAP
            </Text>
            <Title order={1} size="clamp(44px, 6vw, 82px)" lh={0.95}>
              Stop wasting your first week.
            </Title>
            <Text size="xl" c="dark.1" lh={1.6}>
              Paste a GitHub repository. Get a complete onboarding guide for any new engineer in 30 seconds.
            </Text>
            <form action={signInWithGitHub}>
              <Button type="submit" leftSection={<Github size={18} />} size="md">
                Continue with GitHub
              </Button>
            </form>
            <Text c="dark.2">No setup required · Works on any public repo · Shareable links</Text>
          </Stack>
        </GridCol>

        <GridCol span={{ base: 12, md: 6 }}>
          <Card p="xl" radius="sm" bg="dark.7">
            <Stack gap="lg">
              <Group justify="space-between">
                <Text ff="monospace" fw={700}>
                  vercel/next.js
                </Text>
                <Badge>TypeScript</Badge>
              </Group>
              <Text c="dark.1" lh={1.6}>
                A React framework organized around route segments, server rendering, and build-time optimization.
                New engineers should start with the app router, compiler packages, and examples that mirror common usage.
              </Text>
              <Divider />
              <Stack gap="sm">
                <Text fw={700}>Architecture</Text>
                <Text c="dark.1">
                  The codebase is a monorepo with framework packages, integration tests, examples, and docs split by
                  ownership boundaries.
                </Text>
              </Stack>
              <Divider />
              <Stack gap="sm">
                <Text fw={700}>Start Here</Text>
                {['packages/next/src/server/next.ts', 'packages/next/src/client/index.tsx', 'test/integration/app-dir'].map(
                  (file, index) => (
                    <Group key={file} wrap="nowrap" align="flex-start">
                      <Text ff="monospace" c="dark.2" w={24}>
                        {index + 1}.
                      </Text>
                      <Text ff="monospace">{file}</Text>
                    </Group>
                  ),
                )}
              </Stack>
            </Stack>
          </Card>
        </GridCol>
      </Grid>
    </Box>
  );
}
