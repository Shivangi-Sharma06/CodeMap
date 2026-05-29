import { Skeleton, Stack } from '@mantine/core';

export function ReportSkeleton() {
  return (
    <Stack gap="md" className="report-intro">
      <Skeleton height={34} width="52%" />
      <Skeleton height={16} width="70%" />
      <Skeleton height={16} width="64%" />
      <Skeleton height={120} />
      <Skeleton height={180} />
      <Skeleton height={160} />
    </Stack>
  );
}
