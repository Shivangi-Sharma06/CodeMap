'use client';

import { AppShell, Burger, Group, ScrollArea } from '@mantine/core';
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
      header={{ height: 56 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      bg="dark.9"
    >
      <AppShell.Header bg="dark.8" hiddenFrom="sm">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" aria-label="Toggle navigation" />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar bg="dark.8" p="md">
        <Sidebar user={user} />
      </AppShell.Navbar>
      <AppShell.Main>
        <ScrollArea.Autosize mah="calc(100vh - 48px)" type="never">
          {children}
        </ScrollArea.Autosize>
      </AppShell.Main>
    </AppShell>
  );
}
