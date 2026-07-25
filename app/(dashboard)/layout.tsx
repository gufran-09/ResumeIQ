'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LoadingScreen } from '@/components/shared/loading-screen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
