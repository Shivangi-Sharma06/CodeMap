'use client';

import { AppShell, Box, Burger, Group, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from './Sidebar';

type AppShellWrapperProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function AppShellWrapper({ children, user }: AppShellWrapperProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        width: 288,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      bg="dark.9"
    >
      <AppShell.Header className="app-sidebar" hiddenFrom="sm">
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Box className="app-brand-mark">Codemap</Box>
          </Group>
          <Burger opened={opened} onClick={toggle} size="sm" aria-label="Toggle navigation" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar className="app-sidebar" p="xl">
        <Sidebar user={user} />
      </AppShell.Navbar>
      <AppShell.Main bg="dark.9">
        <ScrollArea.Autosize mah="calc(100vh - 72px)" type="never">
          {children}
        </ScrollArea.Autosize>
      </AppShell.Main>
    </AppShell>
  );
}
