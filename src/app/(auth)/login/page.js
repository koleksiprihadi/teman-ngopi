// src/app/(auth)/login/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { signIn, user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && profile) {
      router.replace(profile.role === 'OWNER' ? '/owner/dashboard' : '/kasir');
    }
  }, [user, profile, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Selamat datang! ☕');
    } catch (err) {
      toast.error(err.message === 'Invalid login credentials'
        ? 'Email atau password salah'
        : 'Gagal masuk: ' + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-coffee-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-coffee-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-coffee-900/40 rounded-full blur-3xl" />
        {/* Coffee beans pattern */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 text-4xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              fontSize: `${24 + Math.random() * 24}px`,
            }}
          >
            ☕
          </div>
        ))}
      </div>

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-4 border border-white/20">
            <span className="text-4xl">☕</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-cream-100 text-shadow">
            Teman Ngopi
          </h1>
          <p className="text-coffee-100/60 mt-1 text-sm font-medium">
            Point of Sale System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-cream-100 mb-6">Masuk ke Sistem</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cream-100/70 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40 text-sm">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 focus:border-coffee-400 rounded-xl px-4 py-3 pl-9 text-cream-100 placeholder-cream-100/30 outline-none transition-all text-sm"
                  placeholder="email@contoh.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-cream-100/70 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40 text-sm">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 focus:border-coffee-400 rounded-xl px-4 py-3 pl-9 pr-10 text-cream-100 placeholder-cream-100/30 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-100/40 hover:text-cream-100/70 text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-400 hover:bg-coffee-500 active:bg-coffee-600 text-coffee-900 font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Masuk...
                </span>
              ) : '☕ Masuk Sekarang'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-center text-xs text-cream-100/40">
              Demo: owner@temanngopi.com / kasir@temanngopi.com
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-cream-100/30 mt-6">
          © 2024 Teman Ngopi POS · Powered by TeknoMaven
        </p>
      </div>
    </div>
  );
}
