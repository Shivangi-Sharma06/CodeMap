'use client';

import { Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { GitBranch } from 'lucide-react';
import { useState } from 'react';
import { isValidGitHubRepoUrl } from '@/lib/utils';

type AnalyzeFormProps = {
  onSubmit: (repoUrl: string) => Promise<void>;
  loading: boolean;
};

export function AnalyzeForm({ onSubmit, loading }: AnalyzeFormProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidGitHubRepoUrl(repoUrl)) {
      setError('Enter a valid GitHub repository URL.');
      return;
    }

    setError(null);
    await onSubmit(repoUrl);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack maw={760} gap="md" className="report-intro">
        <Stack gap={4}>
          <Text className="app-kicker">Step 1</Text>
          <Title order={2} ff="monospace" className="app-heading" size="h3">
            Repository Input
          </Title>
          <Text c="dark.2">
            Paste a public GitHub repo URL and generate an onboarding map with architecture, setup, and first-week
            guidance.
          </Text>
        </Stack>
        <TextInput
          label="Repository URL"
          placeholder="https://github.com/owner/repository"
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.currentTarget.value)}
          error={error}
          size="md"
        />
        <Button type="submit" leftSection={<GitBranch size={16} />} loading={loading} w="fit-content">
          Generate Report
        </Button>
        <Text size="sm" c="dark.2">
          Works on any public GitHub repository.
        </Text>
      </Stack>
    </form>
  );
}
