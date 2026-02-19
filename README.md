# ☕ Teman Ngopi POS

Sistem Point of Sale modern berbasis **offline-first** untuk coffee shop.

---

## 🚀 Fitur Utama

- ✅ **Offline-First** - Bisa dipakai 100% tanpa internet
- 📱 **PWA** - Installable di Android & iOS
- 💳 **Transaksi** - Tunai & Non Tunai
- 📋 **Open Bill** - Simpan pesanan tanpa bayar
- ⏰ **Cut-off System** - Manajemen jam tutup
- 📚 **Buku Kas** - Pencatatan kas otomatis
- 📊 **Laporan** - Laba rugi, rekap harian
- 🧾 **Print Struk** - Thermal 58mm / 80mm
- 🌐 **Menu Publik** - Halaman menu yang bisa diakses tamu
- 🔄 **Auto Sync** - Data otomatis tersinkron saat online

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Bahasa | JavaScript |
| Database Online | Supabase (PostgreSQL) |
| Database Offline | Dexie (IndexedDB) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Hosting | Vercel |

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (kasir)/kasir/         # Halaman POS kasir
│   ├── (owner)/               # Dashboard owner
│   │   ├── owner/dashboard/   # Dashboard utama
│   │   ├── owner/products/    # Manajemen produk
│   │   ├── owner/cashbook/    # Buku kas
│   │   ├── owner/reports/     # Laporan keuangan
│   │   ├── owner/users/       # Kelola kasir
│   │   └── owner/settings/    # Pengaturan
│   ├── menu/                  # Menu publik
│   └── api/                   # API Routes
│       ├── products/
│       ├── transactions/
│       ├── cashbook/
│       ├── users/
│       └── sync/
├── components/
│   ├── ui/                    # StatusIndicator, dll
│   ├── pos/                   # CartItem, PaymentModal, OpenBillModal
│   ├── owner/                 # Komponen dashboard
│   └── layout/                # Header, Sidebar
├── lib/
│   ├── dexie/db.js            # Database offline
│   ├── prisma/client.js       # Database online
│   ├── supabase/client.js     # Auth & Supabase
│   ├── auth/authContext.js    # Auth context
│   └── sync/syncManager.js   # Sistem sinkronisasi
├── hooks/
│   ├── useCart.js
│   ├── useProducts.js
│   └── useOnlineStatus.js
└── utils/
    ├── currency.js
    ├── date.js
    └── print.js
```

---

## ⚙️ Instalasi & Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd teman-ngopi
npm install
```

### 2. Setup Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Pergi ke **Settings → API** dan copy:
   - Project URL
   - anon public key
   - service_role key
3. Aktifkan **Email Auth** di Authentication → Providers

### 3. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Isi `.env.local`:
```env
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
npm run db:generate
npm run db:push
```

### 5. Buat Akun Owner Pertama

Di Supabase Dashboard → Authentication → Users, buat user dengan email owner.

Lalu di SQL Editor, jalankan:
```sql
INSERT INTO "User" (id, email, name, role, "isActive")
VALUES (
  '<supabase-user-id>',
  'owner@temanngopi.com',
  'Owner Teman Ngopi',
  'OWNER',
  true
);
```

### 6. Seed Data Produk (Opsional)

```sql
INSERT INTO "Product" (id, name, category, price, cost, "isAvailable", unit) VALUES
  (gen_random_uuid(), 'Kopi Hitam', 'Kopi', 10000, 4000, true, 'cup'),
  (gen_random_uuid(), 'Kopi Susu', 'Kopi', 15000, 6000, true, 'cup'),
  (gen_random_uuid(), 'Cappuccino', 'Kopi', 20000, 8000, true, 'cup'),
  (gen_random_uuid(), 'Americano', 'Kopi', 18000, 7000, true, 'cup'),
  (gen_random_uuid(), 'Matcha Latte', 'Non-Kopi', 22000, 9000, true, 'cup'),
  (gen_random_uuid(), 'Teh Susu', 'Non-Kopi', 12000, 4000, true, 'cup'),
  (gen_random_uuid(), 'Roti Bakar', 'Makanan', 15000, 6000, true, 'porsi'),
  (gen_random_uuid(), 'Nasi Goreng', 'Makanan', 25000, 12000, true, 'porsi');
```

### 7. Jalankan Development

```bash
npm run dev
```

Akses di: `http://localhost:3000`

---

## 🚀 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Set environment variables di Vercel Dashboard → Settings → Environment Variables.

---

## 👤 Role & Hak Akses

| Fitur | Kasir | Owner |
|-------|-------|-------|
| Input transaksi | ✅ | ✅ |
| Open Bill | ✅ | ✅ |
| Print struk | ✅ | ✅ |
| Lihat buku kas | ❌ | ✅ |
| Laporan keuangan | ❌ | ✅ |
| Kelola produk | ❌ | ✅ |
| Kelola kasir | ❌ | ✅ |
| Pengaturan | ❌ | ✅ |
| Akses menu publik | ✅ | ✅ |

---

## 📱 PWA & Offline

Aplikasi bisa diinstal di Android/iOS:

1. Buka di Chrome/Safari
2. Klik "Add to Home Screen" / "Install App"
3. Aplikasi siap digunakan offline!

Data tersimpan di IndexedDB dan akan otomatis tersinkron saat kembali online.

---

## 🖨️ Print Struk

Format struk tersedia untuk:
- **Thermal 58mm** - HP & kertas sempit
- **Thermal 80mm** - Standar kasir
- Print via browser (Ctrl+P)

---

## ⏰ Sistem Cut-Off

- Owner mengatur jam cut-off (default: 22:00)
- Transaksi **sebelum** jam cut-off → masuk buku kas hari ini
- Transaksi **setelah** jam cut-off → status **GANTUNG**
- Transaksi gantung masuk buku kas hari berikutnya saat owner input modal awal

---

## 🔄 Sistem Sinkronisasi

1. **Offline**: Data disimpan ke IndexedDB + ditambahkan ke sync queue
2. **Online**: Sync queue dikirim ke server otomatis
3. **Retry**: Gagal sync dicoba ulang hingga 3x
4. **Conflict**: Server sebagai master (server wins)

Status sync ditampilkan di header:
- 🟢 Online - Semua tersinkron
- 🔄 Syncing - Sedang menyinkron
- 🔴 Offline - Tanpa koneksi
- ⚠️ Error - Ada error sync

---

## 📞 Support

Dikembangkan oleh **TeknoMaven**
- Email: info@teknomavendev.com
- Website: teknomavendev.com

---

*© 2024 Teman Ngopi POS · Powered by TeknoMaven*
