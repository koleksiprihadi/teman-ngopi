// src/app/(owner)/owner/users/page.js
'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  OWNER: { label: 'Owner', color: 'badge-coffee', icon: '👑' },
  KASIR: { label: 'Kasir', color: 'badge-blue', icon: '🧾' },
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'KASIR' };

export default function UsersPage() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [showPassField, setShowPassField] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
      else toast.error('Gagal memuat data pengguna');
    } catch {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setShowPassField(false);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowPassField(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm(EMPTY_FORM);
    setShowPassField(false);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (showPassField && form.password) {
          if (form.password.length < 8) {
            toast.error('Password minimal 8 karakter');
            setSaving(false);
            return;
          }
          payload.password = form.password;
        }
        const res = await fetch(`/api/users/${editUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('✅ Data pengguna diperbarui');
          closeForm();
          fetchUsers();
        } else {
          toast.error(data.message || 'Gagal memperbarui pengguna');
        }
      } else {
        if (form.password.length < 8) {
          toast.error('Password minimal 8 karakter');
          setSaving(false);
          return;
        }
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('✅ Pengguna berhasil ditambahkan');
          closeForm();
          fetchUsers();
        } else {
          toast.error(data.message || 'Gagal menambahkan pengguna');
        }
      }
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId, current) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        toast.success(current ? 'Pengguna dinonaktifkan' : 'Pengguna diaktifkan');
        fetchUsers();
      }
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success('🗑️ Pengguna dihapus');
        fetchUsers();
      } else {
        toast.error(data.message || 'Gagal menghapus pengguna');
      }
    } catch {
      toast.error('Gagal menghapus pengguna');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">👥 Kelola Pengguna</h1>
          <p className="text-sm text-coffee-400 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          ➕ Tambah Pengguna
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="text-4xl animate-spin-slow">☕</div>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-coffee-400 font-medium">Belum ada pengguna</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map(user => {
            const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.KASIR;
            return (
              <div
                key={user.id}
                className={`card flex flex-col gap-3 transition-opacity ${!user.isActive ? 'opacity-55' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-coffee-100 rounded-full flex items-center justify-center text-lg font-bold text-coffee-800 flex-shrink-0">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-coffee-900 truncate">{user.name}</p>
                      <p className="text-xs text-coffee-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className={`badge ${rc.color} flex-shrink-0`}>
                    {rc.icon} {rc.label}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-coffee-100">
                  <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                    {user.isActive ? '🟢 Aktif' : '🔴 Nonaktif'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(user)}
                      className="text-xs text-coffee-500 hover:text-coffee-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    {user.role !== 'OWNER' && (
                      <>
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className="text-xs text-amber-500 hover:text-amber-700 font-semibold transition-colors"
                          title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                          title="Hapus pengguna"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT ── */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeForm}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="bg-coffee-gradient px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-cream-100">
                  {editUser ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna'}
                </h3>
                {editUser && (
                  <p className="text-white/50 text-xs mt-0.5">{editUser.email}</p>
                )}
              </div>
              <button onClick={closeForm} className="text-white/50 hover:text-white text-xl leading-none">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Nama */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className="input-field"
                  placeholder="Nama lengkap pengguna"
                  required
                  autoFocus
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className="input-field"
                  placeholder="email@contoh.com"
                  required
                />
                {editUser && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    ⚠️ Mengubah email akan mempengaruhi login pengguna
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-semibold text-coffee-700 block mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => setField('role', e.target.value)}
                  className="input-field"
                >
                  <option value="KASIR">🧾 Kasir</option>
                  <option value="OWNER">👑 Owner</option>
                </select>
              </div>

              {/* Password */}
              {!editUser ? (
                /* Mode TAMBAH: wajib isi password */
                <div>
                  <label className="text-sm font-semibold text-coffee-700 block mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <PasswordInput
                    value={form.password}
                    onChange={v => setField('password', v)}
                    placeholder="Minimal 8 karakter"
                    required
                  />
                </div>
              ) : (
                /* Mode EDIT: toggle ganti password */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-coffee-700">Password</label>
                    <button
                      type="button"
                      onClick={() => { setShowPassField(v => !v); setField('password', ''); }}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all border ${
                        showPassField
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-coffee-50 text-coffee-700 border-coffee-200 hover:bg-coffee-100'
                      }`}
                    >
                      {showPassField ? '✕ Batal ganti' : '🔑 Ganti Password'}
                    </button>
                  </div>

                  {showPassField ? (
                    <div className="space-y-1.5">
                      <PasswordInput
                        value={form.password}
                        onChange={v => setField('password', v)}
                        placeholder="Password baru (min 8 karakter)"
                        autoFocus
                      />
                      {form.password.length > 0 && form.password.length < 8 && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          ⚠️ Terlalu pendek ({form.password.length}/8 karakter)
                        </p>
                      )}
                      {form.password.length >= 8 && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          ✅ Password valid
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-coffee-50 border border-coffee-200 rounded-xl px-3 py-2.5">
                      <span className="text-coffee-400 text-sm">🔒</span>
                      <span className="text-sm text-coffee-500">Password tidak diubah</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={closeForm} className="btn-secondary py-3">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary py-3 disabled:opacity-50">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menyimpan...
                    </span>
                  ) : editUser ? '✅ Simpan Perubahan' : '✅ Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🗑️
              </div>
              <h3 className="font-display text-lg font-bold text-coffee-900 mb-2">Hapus Pengguna?</h3>
              <p className="text-sm text-coffee-500 mb-6">
                Akun ini akan dihapus permanen dari sistem dan tidak dapat dipulihkan.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-2.5">
                  Batal
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger py-2.5">
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-komponen: Password Input dengan toggle show/hide ──
function PasswordInput({ value, onChange, placeholder, required, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field pr-10"
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        autoComplete="new-password"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-400 hover:text-coffee-700 transition-colors text-sm select-none"
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
