'use client';

import { Button, Group, Loader, Stack, Text } from '@mantine/core';
import { CheckCircle2, Circle } from 'lucide-react';
import type { AnalyzeStatus, StatusStep } from '@/types';
import { formatStepName } from '@/lib/utils';

type AnalyzeProgressProps = {
  status: AnalyzeStatus | null;
  onRetry: () => void;
};

function StepIcon({ step }: { step: StatusStep }) {
  if (step.status === 'COMPLETED' || step.status === 'NOT_FOUND') {
    return <CheckCircle2 size={18} color="#f5f5f5" />;
  }

  if (step.status === 'STARTED') {
    return <Loader size="xs" color="gray" />;
  }

  if (step.status === 'FAILED') {
    return <Circle size={18} color="#f5f5f5" />;
  }

  return <Circle size={18} color="#3d3d3d" />;
}

function displayStatus(status: string) {
  if (status === 'STARTED') return 'PROCESSING';
  if (status === 'NOT_FOUND') return 'COMPLETED';
  return status;
}

export function AnalyzeProgress({ status, onRetry }: AnalyzeProgressProps) {
  if (!status) {
    return (
      <Group gap="sm" className="app-panel" p="md">
        <Loader size="sm" color="gray" />
        <Text ff="monospace" tt="uppercase" size="sm" c="dark.1">
          Starting analysis
        </Text>
      </Group>
    );
  }

  if (status.status === 'FAILED') {
    return (
      <Stack maw={760} gap="md" className="report-intro">
        {status.steps.map((step) => (
          <Group key={step.step} wrap="nowrap" align="center">
            <StepIcon step={step} />
            <Text ff="monospace" size="sm" w={110} c="dark.1">
              {displayStatus(step.status)}
            </Text>
            <Text>{formatStepName(step.step)}</Text>
            {step.durationMs !== null && (
              <Text ff="monospace" size="sm" c="dark.2" ml="auto">
                {step.durationMs}ms
              </Text>
            )}
          </Group>
        ))}
        <Text c="dark.1">{status.errorMessage ?? 'Analysis failed.'}</Text>
        <Button onClick={onRetry} w="fit-content">
          Try Again
        </Button>
      </Stack>
    );
  }

  return (
    <Stack maw={760} gap="md" className="report-intro">
      {status.steps.map((step) => (
        <Group key={step.step} wrap="nowrap" align="center">
          <StepIcon step={step} />
          <Text ff="monospace" size="sm" w={110} c="dark.1">
            {displayStatus(step.status)}
          </Text>
          <Text>{formatStepName(step.step)}</Text>
          {step.durationMs !== null && (
            <Text ff="monospace" size="sm" c="dark.2" ml="auto">
              {step.durationMs}ms
            </Text>
          )}
        </Group>
      ))}
    </Stack>
  );
}
