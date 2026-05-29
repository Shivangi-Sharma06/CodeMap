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
    <Box mih="100vh" px={{ base: 'lg', md: 64 }} py={{ base: 28, md: 36 }} className="app-canvas">
      <Group justify="space-between" align="center" py="md" className="app-rail">
        <Box className="app-brand-mark">Codemap</Box>
        <Text className="app-kicker">Repository onboarding maps</Text>
      </Group>
      <Grid align="stretch" gutter={{ base: 32, md: 56 }} mih="calc(100vh - 120px)" pt={{ base: 40, md: 64 }}>
        <GridCol span={{ base: 12, md: 6 }}>
          <Stack gap="xl" maw={640}>
            <Text className="app-kicker">Launch system</Text>
            <Title order={1} size="clamp(46px, 6vw, 88px)" lh={0.92} className="app-heading">
              Stop wasting your first week.
            </Title>
            <Text size="xl" c="dark.1" lh={1.65} maw={560}>
              Paste a GitHub repository. Get a complete onboarding guide for any new engineer in 30 seconds.
            </Text>
            <Group gap="sm" wrap="wrap">
              <Badge className="app-chip">Public repos</Badge>
              <Badge className="app-chip">GitHub auth</Badge>
              <Badge className="app-chip">Shareable reports</Badge>
            </Group>
            <form action={signInWithGitHub}>
              <Button type="submit" leftSection={<Github size={18} />} size="md">
                Continue with GitHub
              </Button>
            </form>
            <Text c="dark.2">No setup required · Works on any public repo · Shareable links</Text>
          </Stack>
        </GridCol>

        <GridCol span={{ base: 12, md: 6 }}>
          <Card p="xl" className="app-panel" radius="md" h="100%">
            <Stack gap="lg" h="100%" justify="space-between">
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4}>
                    <Text className="app-kicker">Live example</Text>
                    <Text ff="monospace" fw={700}>
                      vercel/next.js
                    </Text>
                  </Stack>
                  <Badge className="app-chip">TypeScript</Badge>
                </Group>
                <Text c="dark.1" lh={1.6}>
                  A React framework organized around route segments, server rendering, and build-time optimization.
                  New engineers should start with the app router, compiler packages, and examples that mirror common usage.
                </Text>
              </Stack>
              <Stack gap="md">
                <Divider color="dark.5" />
                <Stack gap="sm">
                  <Text fw={700} className="app-heading" size="sm">
                    Architecture
                  </Text>
                  <Text c="dark.1">
                    The codebase is a monorepo with framework packages, integration tests, examples, and docs split by
                    ownership boundaries.
                  </Text>
                </Stack>
                <Divider color="dark.5" />
                <Stack gap="sm">
                  <Text fw={700} className="app-heading" size="sm">
                    Start Here
                  </Text>
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
            </Stack>
          </Card>
        </GridCol>
      </Grid>
    </Box>
  );
}
