'use client';

import { Alert, Stack, Title } from '@mantine/core';
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
      <Title order={1}>New Analysis</Title>
      {error && (
        <Alert color="gray" title="Could not start analysis">
          {error}
        </Alert>
      )}
      {!reportId ? (
        <AnalyzeForm onSubmit={startAnalysis} loading={submitting} />
      ) : (
        <Stack gap="lg">
          <Title order={2} ff="monospace" size="h3">
            {repoUrl}
          </Title>
          <AnalyzeProgress status={status} onRetry={retry} />
        </Stack>
      )}
    </Stack>
  );
}
