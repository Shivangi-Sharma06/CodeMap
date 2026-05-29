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
        <Text ff="monospace" fw={700} size="sm" c="dark.0" style={{ letterSpacing: 2 }}>
          CODEMAP
        </Text>
        <Stack gap={4}>
          <NavLink
            component={Link}
            href="/dashboard"
            label="Dashboard"
            leftSection={<TableProperties size={16} />}
            active={pathname === '/dashboard'}
            color="gray"
          />
          <NavLink
            component={Link}
            href="/analyze"
            label="New Analysis"
            leftSection={<Plus size={16} />}
            active={pathname === '/analyze'}
            color="gray"
          />
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Box p="sm" bg="dark.7" style={{ border: '1px solid #1f1f1f' }}>
          <Group gap="xs" wrap="nowrap" align="flex-start">
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
          <Divider my="sm" />
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <GitBranch size={14} color="#888888" />
            <Text size="xs" c="dark.2" lh={1.45}>
              Reports use your GitHub session token for higher public API limits.
            </Text>
          </Group>
        </Box>
        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" c="dark.2">
            Account
          </Text>
          <Tooltip label="Log out">
            <ActionIcon
              onClick={() => void signOut({ callbackUrl: '/login' })}
              variant="subtle"
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
