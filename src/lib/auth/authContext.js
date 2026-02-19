// src/lib/auth/authContext.js
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase/client';
import db from '@/lib/dexie/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) { setProfile(null); return; }
    try {
      // Try local first
      const local = await db.users.where('email').equals(authUser.email).first();
      if (local) {
        setProfile(local);
        return;
      }
      // Fetch from server
      const res = await fetch(`/api/users/me?email=${authUser.email}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Cache locally
        await db.users.put({ ...data, serverId: data.id });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
