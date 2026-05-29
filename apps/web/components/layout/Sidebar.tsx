'use client';

import { ActionIcon, Avatar, Box, Divider, Group, NavLink, Stack, Text, Tooltip } from '@mantine/core';
import { FileText, GitBranch, LogOut, Plus, TableProperties } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <Stack h="100%" justify="space-between" gap="xl">
      <Stack gap="xl">
        <Stack gap={8}>
          <Text className="app-kicker">Mission Control</Text>
          <Text ff="monospace" fw={700} size="xl" c="dark.0" style={{ letterSpacing: 3 }}>
            CODEMAP
          </Text>
          <Text size="sm" c="dark.2" lh={1.6}>
            Explore, analyze, and share onboarding maps for public repositories.
          </Text>
        </Stack>
        <Stack gap={6}>
          <NavLink
            component={Link}
            href="/dashboard"
            label="Dashboard"
            leftSection={<TableProperties size={16} />}
            active={pathname === '/dashboard'}
            className="app-chip"
          />
          <NavLink
            component={Link}
            href="/analyze"
            label="New Analysis"
            leftSection={<Plus size={16} />}
            active={pathname === '/analyze'}
            className="app-chip"
          />
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Box p="md" className="app-panel">
          <Stack gap="md">
            <Group gap="sm" wrap="nowrap" align="flex-start">
            <Avatar src={user.image} size={34} radius="xl">
              <FileText size={15} />
            </Avatar>
            <Box miw={0}>
              <Text size="sm" fw={600} truncate>
                {user.name ?? 'GitHub user'}
              </Text>
              <Text size="xs" c="dark.2" truncate>
                {user.email ?? 'Signed in with GitHub'}
              </Text>
            </Box>
            </Group>
            <Divider color="dark.5" />
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <GitBranch size={14} color="#bdbdbd" />
              <Text size="xs" c="dark.2" lh={1.45}>
                Reports use your GitHub session token for higher public API limits.
              </Text>
            </Group>
          </Stack>
        </Box>
        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" c="dark.2">
            Account
          </Text>
          <Tooltip label="Log out">
            <ActionIcon
              onClick={() => void signOut({ callbackUrl: '/login' })}
              variant="outline"
              color="gray"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Stack>
  );
}
