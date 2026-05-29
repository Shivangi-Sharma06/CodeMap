import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { Github } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/lib/auth';

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  async function signInWithGitHub() {
    'use server';
    await signIn('github', { redirectTo: '/dashboard' });
  }

  return (
    <Stack mih="100vh" align="center" justify="center" bg="dark.9" px="lg">
      <Card w="100%" maw={420} p="xl">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={1} ff="monospace" size="h2">
              CodeMap
            </Title>
            <Text c="dark.1">Day-1 codebase guides from public GitHub repositories.</Text>
          </Stack>
          <form action={signInWithGitHub}>
            <Button type="submit" fullWidth leftSection={<Github size={18} />}>
              Continue with GitHub
            </Button>
          </form>
          <Text size="sm" c="dark.2">
            Only public repository access is requested.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
