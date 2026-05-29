import { ActionIcon, Group, Table, Text, Tooltip } from '@mantine/core';
import { ChevronRight, Share2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Report } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

type ReportCardProps = {
  report: Report;
  onShare: (report: Report) => void;
  onDelete: (report: Report) => void;
};

export function ReportRow({ report, onShare, onDelete }: ReportCardProps) {
  return (
    <Table.Tr>
      <Table.Td>
        <Text component={Link} href={`/report/${report.id}`} ff="monospace" fw={600}>
          {report.repoFullName}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" ff="monospace" tt="uppercase">
          {report.status}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dark.1">
          {report.repoLanguage ?? 'Unknown'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dark.2">
          {formatRelativeDate(report.createdAt)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="nowrap">
          <Tooltip label="View report">
            <ActionIcon component={Link} href={`/report/${report.id}`} variant="subtle" color="gray" aria-label="View">
              <ChevronRight size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={report.isPublic ? 'Unshare report' : 'Share report'}>
            <ActionIcon variant="subtle" color="gray" aria-label="Share" onClick={() => onShare(report)}>
              <Share2 size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete report">
            <ActionIcon variant="subtle" color="gray" aria-label="Delete" onClick={() => onDelete(report)}>
              <Trash2 size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
