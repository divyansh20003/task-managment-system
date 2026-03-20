'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckSquare, LayoutDashboard, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      toast.success('Signed out');
    } catch {
      toast.error('Logout failed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm shadow-brand-200">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">Taskflow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              pathname === href
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-30">
        <button onClick={() => setMobileOpen(true)} className="btn-ghost btn-sm p-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900">Taskflow</span>
        </div>
      </div>

      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-20">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white shadow-xl flex flex-col animate-slide-up">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 btn-ghost btn-sm p-1.5">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
