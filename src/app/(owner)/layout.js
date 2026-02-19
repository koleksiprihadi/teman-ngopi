// src/app/(owner)/layout.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/authContext';
import StatusIndicator from '@/components/ui/StatusIndicator';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/owner/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/owner/cashbook', icon: '💰', label: 'Buku Kas' },
  { href: '/owner/reports', icon: '📈', label: 'Laporan' },
  { href: '/owner/products', icon: '🍽️', label: 'Produk' },
  { href: '/owner/categories', icon: '🏷️', label: 'Kategori' },
  { href: '/owner/users', icon: '👥', label: 'Kasir' },
  { href: '/owner/settings', icon: '⚙️', label: 'Pengaturan' },
];

export default function OwnerLayout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && profile && profile.role !== 'OWNER') {
      router.replace('/kasir');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-gradient flex items-center justify-center">
        <div className="text-5xl animate-spin-slow">☕</div>
      </div>
    );
  }
  if (!user || !profile) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    toast.success('Sampai jumpa! ☕');
  };

  return (
    <div className="flex h-screen bg-cream-100 overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-warm-gradient flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-2xl">☕</div>
            <div>
              <h1 className="font-display text-lg font-bold text-cream-100 leading-tight">Teman Ngopi</h1>
              <p className="text-xs text-white/40">Owner Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-item ${pathname === item.href || pathname?.startsWith(item.href + '/') ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10 mt-2">
            <Link
              href="/kasir"
              className="sidebar-item"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-lg">🧾</span>
              <span>Mode Kasir</span>
            </Link>
          </div>
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-coffee-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <p className="text-sm font-semibold text-cream-100">{profile?.name}</p>
              <p className="text-xs text-white/40">Owner</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left sidebar-item text-red-300 hover:text-red-200 hover:bg-red-500/20 text-sm"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-coffee-100 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-coffee-100 text-coffee-700 transition-colors"
            >
              ☰
            </button>
            <div className="hidden lg:block">
              <h2 className="font-display font-semibold text-coffee-900">
                {NAV_ITEMS.find(n => n.href === pathname)?.label || 'Owner Dashboard'}
              </h2>
            </div>
          </div>
          <StatusIndicator />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
