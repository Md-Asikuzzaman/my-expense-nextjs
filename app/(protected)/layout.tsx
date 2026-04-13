import { Suspense } from 'react';
import { connection } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { QuickAddModal } from '@/components/dashboard/quick-add-modal';
import {
  MobileHeader,
  DesktopSidebar,
} from '@/components/layout/mobile-sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}

function LayoutSkeleton() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
    </div>
  );
}

async function ProtectedShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await requireAuth();

  return (
    <div className='min-h-screen bg-background'>
      {/* Mobile Header */}
      <MobileHeader userEmail={session.email} />

      {/* Desktop Sidebar */}
      <DesktopSidebar userEmail={session.email} />

      {/* Main Content */}
      <main className='min-h-screen lg:pl-[260px]'>
        <div className='mx-auto max-w-7xl p-4 sm:p-6 lg:p-8'>
          <div className='space-y-6'>{children}</div>
        </div>
      </main>

      {/* Quick Add FAB */}
      <div className='fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6'>
        <QuickAddModal />
      </div>
    </div>
  );
}
