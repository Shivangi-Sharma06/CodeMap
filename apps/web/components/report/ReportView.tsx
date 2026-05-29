'use client';

import {
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AlertTriangle, ExternalLink, Share2, Trash2 } from 'lucide-react';
import type { Report } from '@/types';

type ReportViewProps = {
  report: Report;
  publicView?: boolean;
  onShare?: () => Promise<void>;
  onDelete?: () => Promise<void>;
};

const toc = [
  ['overview', 'Overview'],
  ['tech-stack', 'Tech Stack'],
  ['architecture', 'Architecture'],
  ['start-here', 'Start Here'],
  ['glossary', 'Glossary'],
  ['setup-guide', 'Setup Guide'],
  ['first-week-tasks', 'First Week Tasks'],
  ['warnings', 'Warnings'],
  ['repo-health', 'Repo Health'],
] as const;

export function ReportView({ report, publicView = false, onShare, onDelete }: ReportViewProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const result = report.result;

  if (!result) {
    return (
      <Stack gap="xs">
        <Title order={1} ff="monospace">
          {report.repoFullName}
        </Title>
        <Text c="dark.1">This report has no completed analysis yet.</Text>
      </Stack>
    );
  }

  const visibleToc = toc.filter(([id]) => id !== 'warnings' || (result.warnings?.length ?? 0) > 0);

  return (
    <>
      <Box className="report-shell">
        <nav className="report-toc" aria-label="Report sections">
          {visibleToc.map(([id, label]) => (
            <Anchor key={id} href={`#${id}`} c="dark.2" size="sm">
              {label}
            </Anchor>
          ))}
        </nav>

        <Stack className="report-content" gap={0}>
          {!publicView && (
            <Group justify="flex-end" mb="lg">
              <Button leftSection={<Share2 size={16} />} onClick={onShare}>
                {report.isPublic ? 'Unshare' : 'Share'}
              </Button>
              <Button leftSection={<Trash2 size={16} />} onClick={open}>
                Delete
              </Button>
            </Group>
          )}

          <section id="overview" className="report-section">
            <Box className="report-surface">
              <Stack gap="lg">
                <Group justify="space-between" align="flex-start" gap="md">
                  <Stack gap="sm">
                    <Text className="report-label">Overview</Text>
                    <Group gap="xs" align="center">
                      <Title order={1} ff="monospace" className="app-heading" style={{ overflowWrap: 'anywhere' }}>
                        {report.repoFullName}
                      </Title>
                      <Anchor href={report.repoUrl} target="_blank" aria-label="Open repository">
                        <ExternalLink size={18} />
                      </Anchor>
                    </Group>
                  </Stack>
                  <Group gap="xs" align="flex-start" wrap="wrap" justify="flex-end">
                    <Badge className="app-chip">{report.repoStars} stars</Badge>
                    <Badge className="app-chip">{report.repoLanguage ?? 'Unknown'}</Badge>
                    {report.repoTopics.slice(0, 6).map((topic) => (
                      <Badge key={topic} className="app-chip">
                        {topic}
                      </Badge>
                    ))}
                  </Group>
                </Group>
                <Text size="lg" c="dark.0" lh={1.75} maw={920}>
                  {result.summary}
                </Text>
              </Stack>
            </Box>
          </section>

          <section id="tech-stack" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                Tech Stack
              </Title>
              <Group gap="xs">
                {result.techStack.map((item) => (
                  <Badge key={item} ff="monospace" className="app-chip">
                    {item}
                  </Badge>
                ))}
              </Group>
            </Box>
          </section>

          <section id="architecture" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                Architecture
              </Title>
              <Text c="dark.0" lh={1.7}>
                {result.architecture}
              </Text>
            </Box>
          </section>

          <section id="start-here" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="lg" className="app-heading" size="h3">
                Start Here
              </Title>
              <Stack gap="md">
                {result.startHere.map((item, index) => (
                  <Box key={`${item.file}-${index}`}>
                    <Group align="flex-start" gap="md" wrap="nowrap">
                      <Text ff="monospace" c="dark.2" w={28}>
                        {index + 1}.
                      </Text>
                      <Box>
                        <Text ff="monospace" fw={600}>
                          {item.file}
                        </Text>
                        <Text c="dark.1" mt={4}>
                          {item.reason}
                        </Text>
                      </Box>
                    </Group>
                    {index < result.startHere.length - 1 && <Divider mt="md" color="dark.5" />}
                  </Box>
                ))}
              </Stack>
            </Box>
          </section>

          <section id="glossary" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                Glossary
              </Title>
              <Table striped withTableBorder className="app-table">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Term</Table.Th>
                    <Table.Th>Definition</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.keyConceptsGlossary.map((item) => (
                    <Table.Tr key={item.term}>
                      <Table.Td>
                        <Text ff="monospace">{item.term}</Text>
                      </Table.Td>
                      <Table.Td>{item.definition}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </section>

          <section id="setup-guide" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                Setup Guide
              </Title>
              <Stack component="ol" gap="sm" pl="lg">
                {result.setupSteps.map((step) => (
                  <Text component="li" key={step}>
                    {step}
                  </Text>
                ))}
              </Stack>
            </Box>
          </section>

          <section id="first-week-tasks" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                First Week Tasks
              </Title>
              <Stack component="ol" gap="sm" pl="lg">
                {result.firstWeekTasks.map((task) => (
                  <Text component="li" key={task}>
                    {task}
                  </Text>
                ))}
              </Stack>
            </Box>
          </section>

          {(result.warnings?.length ?? 0) > 0 && (
            <section id="warnings" className="report-section">
              <Box className="report-section-panel">
                <Title order={2} mb="md" className="app-heading" size="h3">
                  Warnings
                </Title>
                <Stack gap="sm">
                  {result.warnings?.map((warning) => (
                    <Group key={warning} align="flex-start" gap="sm" wrap="nowrap">
                      <AlertTriangle size={17} color="#bdbdbd" />
                      <Text c="dark.1">{warning}</Text>
                    </Group>
                  ))}
                </Stack>
              </Box>
            </section>
          )}

          <section id="repo-health" className="report-section">
            <Box className="report-section-panel">
              <Title order={2} mb="md" className="app-heading" size="h3">
                Repo Health
              </Title>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs">
                {[
                  ['Tests', result.repoHealth.hasTests],
                  ['CI/CD', result.repoHealth.hasCI],
                  ['Docs', result.repoHealth.hasDocumentation],
                  ['Lock file', result.repoHealth.hasDependencyLock],
                  ['License', result.repoHealth.hasLicense],
                ].map(([label, value]) => (
                  <Box key={String(label)} className="report-metric">
                    <Text size="sm" c="dark.1">
                      {label}
                    </Text>
                    <Text ff="monospace" mt={4}>
                      {value ? 'Yes' : 'No'}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </section>
        </Stack>
      </Box>

      <Modal opened={opened} onClose={close} title="Delete report" centered>
        <Stack>
          <Text c="dark.1">This removes the report and its public share link.</Text>
          <Group justify="flex-end">
            <Button onClick={close}>Cancel</Button>
            <Button onClick={onDelete}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
