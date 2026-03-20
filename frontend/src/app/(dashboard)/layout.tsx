'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:ml-64">
            {children}
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
