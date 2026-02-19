// src/app/(owner)/owner/users/page.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'KASIR' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) { const data = await res.json(); setUsers(data); }
    } catch (err) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('✅ Pengguna berhasil ditambahkan');
        setShowForm(false);
        setForm({ name: '', email: '', password: '', role: 'KASIR' });
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Gagal menambahkan pengguna');
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success('Status pengguna diperbarui');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  const ROLE_CONFIG = {
    OWNER: { label: 'Owner', color: 'badge-coffee', icon: '👑' },
    KASIR: { label: 'Kasir', color: 'badge-blue', icon: '🧾' },
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-coffee-900">👥 Kelola Kasir</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          ➕ Tambah Pengguna
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="text-4xl animate-spin-slow">☕</div></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map(user => {
            const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.KASIR;
            return (
              <div key={user.id} className={`card flex flex-col gap-3 ${!user.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-coffee-100 rounded-full flex items-center justify-center text-xl font-bold text-coffee-800">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-coffee-900">{user.name}</p>
                      <p className="text-xs text-coffee-400">{user.email}</p>
                    </div>
                  </div>
                  <span className={`badge ${roleConf.color}`}>
                    {roleConf.icon} {roleConf.label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-coffee-100">
                  <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {user.role !== 'OWNER' && (
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className="text-xs text-coffee-500 hover:text-coffee-800 font-medium underline"
                    >
                      {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="bg-coffee-gradient px-5 py-4">
              <h3 className="font-display text-xl font-bold text-cream-100">➕ Tambah Pengguna</h3>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Nama Lengkap</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Nama..." required />
              </div>
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-field" placeholder="email@contoh.com" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input-field" placeholder="Min 8 karakter" minLength={8} required />
              </div>
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field">
                  <option value="KASIR">🧾 Kasir</option>
                  <option value="OWNER">👑 Owner</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-3">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary py-3">
                  {saving ? '⏳...' : '✅ Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
