import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AppShellWrapper } from '@/components/layout/AppShellWrapper';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <AppShellWrapper user={session.user}>{children}</AppShellWrapper>;
}
