'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiClientError, apiFetch } from '@/lib/api';
import type { Report } from '@/types';
import { ReportRow } from '@/components/report/ReportCard';

export default function DashboardPage() {
  const router = useRouter();
  const clipboard = useClipboard();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    apiFetch<{ reports: Report[] }>('/api/reports')
      .then((payload) => setReports(payload.reports))
      .catch((err: unknown) => {
        if (err instanceof ApiClientError && err.code === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load reports.');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleShare(report: Report) {
    const payload = await apiFetch<{ isPublic: boolean; shareUrl: string }>(`/api/reports/${report.id}/share`, {
      method: 'PATCH',
    });
    setReports((current) =>
      current.map((item) => (item.id === report.id ? { ...item, isPublic: payload.isPublic } : item)),
    );

    if (payload.isPublic) {
      clipboard.copy(payload.shareUrl);
      notifications.show({ title: 'Public link copied', message: payload.shareUrl, color: 'gray' });
    } else {
      notifications.show({ title: 'Report unpublished', message: 'The public link is no longer available.', color: 'gray' });
    }
  }

  function requestDelete(report: Report) {
    setSelected(report);
    open();
  }

  async function confirmDelete() {
    if (!selected) return;
    await apiFetch<void>(`/api/reports/${selected.id}`, { method: 'DELETE' });
    setReports((current) => current.filter((report) => report.id !== selected.id));
    close();
  }

  const completedCount = reports.filter((report) => report.status === 'COMPLETED').length;
  const processingCount = reports.filter((report) => report.status === 'PROCESSING' || report.status === 'PENDING').length;
  const publicCount = reports.filter((report) => report.isPublic).length;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={1}>Your Reports</Title>
            <Text c="dark.1" mt={6}>
              Track generated onboarding guides, public links, and in-flight repository analyses.
            </Text>
          </Box>
          <Button component={Link} href="/analyze" leftSection={<Plus size={16} />}>
            New Analysis
          </Button>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
        {[
          ['Total reports', reports.length],
          ['Completed', completedCount],
          ['Processing', processingCount],
          ['Public links', publicCount],
        ].map(([label, value]) => (
          <Box key={label} p="md" bg="dark.7" style={{ border: '1px solid #1f1f1f' }}>
            <Text size="sm" c="dark.1">
              {label}
            </Text>
            <Text ff="monospace" size="xl" fw={600} mt={4}>
              {loading ? '-' : value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {error && (
        <Alert color="gray" title="Could not load reports">
          {error}
        </Alert>
      )}

      {!loading && reports.length === 0 && !error && (
        <Stack align="flex-start" gap="md">
          <Text c="dark.1">No reports yet. Generate your first onboarding guide from a public GitHub repo.</Text>
          <Button component={Link} href="/analyze" leftSection={<FileText size={16} />}>
            New Analysis
          </Button>
        </Stack>
      )}

      {reports.length > 0 && (
        <Table highlightOnHover withTableBorder verticalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Repository</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Language</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} onShare={handleShare} onDelete={requestDelete} />
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={opened} onClose={close} title="Delete report" centered>
        <Stack>
          <Text c="dark.1">This removes {selected?.repoFullName ?? 'this report'} and its public share link.</Text>
          <Group justify="flex-end">
            <Button onClick={close}>Cancel</Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
