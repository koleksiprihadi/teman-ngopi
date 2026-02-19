// src/app/(kasir)/layout.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import StatusIndicator from '@/components/ui/StatusIndicator';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function KasirLayout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-coffee-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin-slow">☕</div>
          <p className="text-cream-100 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sampai jumpa! ☕');
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-cream-100 overflow-hidden">
      {/* Top Header */}
      <header className="bg-coffee-gradient text-white px-4 py-3 flex items-center justify-between shadow-coffee-lg z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-xl">☕</div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-cream-100">Teman Ngopi</h1>
            <p className="text-xs text-white/50 leading-tight">
              {profile?.name || 'Kasir'} · {profile?.role === 'OWNER' ? 'Owner' : 'Kasir'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusIndicator />

          {profile?.role === 'OWNER' && (
            <Link
              href="/owner/dashboard"
              className="hidden sm:flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            >
              📊 Dashboard
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/30 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          >
            <span className="hidden sm:block">Keluar</span>
            <span>🚪</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
