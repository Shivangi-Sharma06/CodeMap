'use client';

import { ActionIcon, Avatar, Box, Group, NavLink, Stack, Text, Tooltip } from '@mantine/core';
import { FileText, LogOut, Plus, TableProperties } from 'lucide-react';
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

      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" miw={0}>
          <Avatar src={user.image} size={30} radius="xl">
            <FileText size={14} />
          </Avatar>
          <Box miw={0}>
            <Text size="sm" truncate>
              {user.name ?? 'GitHub user'}
            </Text>
            <Text size="xs" c="dark.2" truncate>
              {user.email ?? 'Signed in'}
            </Text>
          </Box>
        </Group>
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
  );
}
