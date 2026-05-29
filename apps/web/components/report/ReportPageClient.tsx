'use client';

import { Alert, Button, Group, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useClipboard } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, ApiClientError } from '@/lib/api';
import type { Report } from '@/types';
import { ReportSkeleton } from './ReportSkeleton';
import { ReportView } from './ReportView';

type ReportPageClientProps = {
  id: string;
};

export function ReportPageClient({ id }: ReportPageClientProps) {
  const router = useRouter();
  const clipboard = useClipboard();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiFetch<{ report: Report }>(`/api/reports/${id}`)
      .then((payload) => {
        if (mounted) {
          setReport(payload.report);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiClientError && err.code === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }

        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load report.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, router]);

  async function handleShare() {
    if (!report) return;

    const payload = await apiFetch<{ isPublic: boolean; shareUrl: string }>(`/api/reports/${report.id}/share`, {
      method: 'PATCH',
    });

    setReport({ ...report, isPublic: payload.isPublic });

    if (payload.isPublic) {
      clipboard.copy(payload.shareUrl);
      notifications.show({ title: 'Public link copied', message: payload.shareUrl, color: 'gray' });
    } else {
      notifications.show({ title: 'Report unpublished', message: 'The public link is no longer available.', color: 'gray' });
    }
  }

  async function handleDelete() {
    if (!report) return;
    await apiFetch<void>(`/api/reports/${report.id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  if (loading) {
    return <ReportSkeleton />;
  }

  if (error || !report) {
    return (
      <Alert color="gray" title="Report unavailable">
        <Stack gap="md">
          <Text>{error ?? 'Report not found.'}</Text>
          <Group>
            <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
          </Group>
        </Stack>
      </Alert>
    );
  }

  if (report.status !== 'COMPLETED') {
    return (
      <Stack>
        <Group gap="sm">
          {report.status === 'PROCESSING' && <Loader size="sm" color="gray" />}
          <Text ff="monospace" fw={600}>
            {report.repoFullName}
          </Text>
        </Group>
        <Text c="dark.1">Status: {report.status}</Text>
        {report.errorMessage && <Text c="dark.1">{report.errorMessage}</Text>}
      </Stack>
    );
  }

  return <ReportView report={report} onShare={handleShare} onDelete={handleDelete} />;
}
