'use client';

import { Alert, Stack, Text, Title } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnalyzeForm } from '@/components/analyze/AnalyzeForm';
import { AnalyzeProgress } from '@/components/analyze/AnalyzeProgress';
import { ApiClientError, apiFetch } from '@/lib/api';
import type { AnalyzeStatus } from '@/types';

export default function AnalyzePage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalyzeStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interval = useInterval(async () => {
    if (!reportId) return;
    const payload = await apiFetch<AnalyzeStatus>(`/api/analyze/${reportId}/status`);
    setStatus(payload);

    if (payload.status === 'COMPLETED') {
      interval.stop();
      router.push(`/report/${reportId}`);
    }

    if (payload.status === 'FAILED') {
      interval.stop();
    }
  }, 2000);

  useEffect(() => {
    if (reportId) {
      interval.start();
    }
    return interval.stop;
  }, [reportId, interval]);

  async function startAnalysis(nextRepoUrl: string) {
    setSubmitting(true);
    setError(null);

    try {
      const payload = await apiFetch<{ reportId: string }>('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ repoUrl: nextRepoUrl }),
      });
      setRepoUrl(nextRepoUrl);
      setReportId(payload.reportId);
      setStatus(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'UNAUTHORIZED') {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to start analysis.');
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setReportId(null);
    setStatus(null);
    setError(null);
  }

  return (
    <Stack gap="xl">
      <Stack gap="md" className="report-intro">
        <Text className="app-kicker">Analysis</Text>
        <Title order={1} className="app-heading">
          New Analysis
        </Title>
        <Text c="dark.1" maw={720}>
          Generate a repository map from a public GitHub URL, then follow the live status as the report is built.
        </Text>
      </Stack>
      {error && (
        <Alert color="gray" title="Could not start analysis">
          {error}
        </Alert>
      )}
      {!reportId ? (
        <AnalyzeForm onSubmit={startAnalysis} loading={submitting} />
      ) : (
        <Stack gap="lg">
          <Title order={2} ff="monospace" size="h3" className="app-heading">
            {repoUrl}
          </Title>
          <AnalyzeProgress status={status} onRetry={retry} />
        </Stack>
      )}
    </Stack>
  );
}
