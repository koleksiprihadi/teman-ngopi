// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// ============================================================
// KONFIGURASI — sesuaikan dengan Supabase project kamu
// ============================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================
// DATA AKUN
// ============================================================
const USERS = [
  {
    email: 'owner@temanngopi.com',
    password: 'owner123456',
    name: 'Admin Owner',
    role: 'OWNER',
  },
  {
    email: 'budi@temanngopi.com',
    password: 'kasir123456',
    name: 'Budi Santoso',
    role: 'KASIR',
  },
  {
    email: 'sari@temanngopi.com',
    password: 'kasir123456',
    name: 'Sari Dewi',
    role: 'KASIR',
  },
];

// ============================================================
// DATA PRODUK
// ============================================================
const PRODUCTS = [
  // ☕ KOPI
  {
    name: 'Kopi Hitam',
    description: 'Kopi robusta pilihan, diseduh dengan air panas, kuat dan berani.',
    category: 'Kopi',
    price: 10000,
    cost: 3500,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80',
  },
  {
    name: 'Kopi Susu',
    description: 'Kopi espresso dengan susu segar, lembut dan creamy.',
    category: 'Kopi',
    price: 15000,
    cost: 6000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&q=80',
  },
  {
    name: 'Cappuccino',
    description: 'Espresso dengan steamed milk dan milk foam yang sempurna.',
    category: 'Kopi',
    price: 20000,
    cost: 8000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
  },
  {
    name: 'Americano',
    description: 'Espresso dengan tambahan air panas, bold dan refreshing.',
    category: 'Kopi',
    price: 18000,
    cost: 7000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?w=400&q=80',
  },
  {
    name: 'Latte',
    description: 'Espresso dengan steamed milk berlimpah, ringan dan smooth.',
    category: 'Kopi',
    price: 22000,
    cost: 9000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80',
  },
  {
    name: 'V60 Pour Over',
    description: 'Manual brew arabika single origin, nuanced dan complex.',
    category: 'Kopi',
    price: 28000,
    cost: 12000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  },
  {
    name: 'Es Kopi Susu',
    description: 'Kopi susu dingin segar dengan es batu, bestseller kami!',
    category: 'Kopi',
    price: 18000,
    cost: 7000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
  },
  {
    name: 'Kopi Aren',
    description: 'Kopi robusta dengan gula aren asli, manis alami khas nusantara.',
    category: 'Kopi',
    price: 20000,
    cost: 8500,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80',
  },

  // 🧃 NON-KOPI
  {
    name: 'Matcha Latte',
    description: 'Matcha premium Jepang dengan susu oat, earthy dan creamy.',
    category: 'Non-Kopi',
    price: 22000,
    cost: 10000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80',
  },
  {
    name: 'Teh Susu',
    description: 'Teh hitam dengan susu evaporasi, klasik dan menghangatkan.',
    category: 'Non-Kopi',
    price: 12000,
    cost: 4500,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    name: 'Es Teh Manis',
    description: 'Teh manis dingin segar, solusi terbaik untuk hari panas.',
    category: 'Non-Kopi',
    price: 8000,
    cost: 2500,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  },
  {
    name: 'Coklat Panas',
    description: 'Dark chocolate premium dicampur susu hangat, mewah dan kaya rasa.',
    category: 'Non-Kopi',
    price: 18000,
    cost: 8000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80',
  },
  {
    name: 'Lemon Tea',
    description: 'Teh hitam segar dengan perasan lemon, asam segar menyegarkan.',
    category: 'Non-Kopi',
    price: 14000,
    cost: 5000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  },
  {
    name: 'Jus Alpukat',
    description: 'Alpukat segar blended dengan susu dan sedikit gula, creamy banget.',
    category: 'Non-Kopi',
    price: 20000,
    cost: 9000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&q=80',
  },

  // 🍱 MAKANAN
  {
    name: 'Roti Bakar Coklat',
    description: 'Roti tawar panggang dengan selai coklat keju, sarapan favorit.',
    category: 'Makanan',
    price: 15000,
    cost: 6000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80',
  },
  {
    name: 'Nasi Goreng Spesial',
    description: 'Nasi goreng dengan telur, ayam, dan sayuran pilihan. Pedas bisa request!',
    category: 'Makanan',
    price: 28000,
    cost: 13000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
  },
  {
    name: 'Mie Goreng',
    description: 'Mie goreng bumbu rahasia dengan topping telur dan ayam.',
    category: 'Makanan',
    price: 25000,
    cost: 11000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
  },
  {
    name: 'Sandwich Club',
    description: 'Roti gandum dengan isian dada ayam, selada, tomat, dan mayo.',
    category: 'Makanan',
    price: 30000,
    cost: 14000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
  },

  // 🍪 SNACK
  {
    name: 'Kentang Goreng',
    description: 'Kentang crispy golden brown, cocok temani kopi kamu.',
    category: 'Snack',
    price: 15000,
    cost: 5000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
  },
  {
    name: 'Croissant Butter',
    description: 'Croissant berlapis mentega premium, renyah diluar lembut didalam.',
    category: 'Snack',
    price: 18000,
    cost: 8000,
    unit: 'pcs',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  },
  {
    name: 'Pisang Goreng',
    description: 'Pisang kepok dibalut tepung renyah, manis alami.',
    category: 'Snack',
    price: 12000,
    cost: 4500,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1603047716552-db53c4a2ae1b?w=400&q=80',
  },
  {
    name: 'Singkong Keju',
    description: 'Singkong goreng tabur keju parut, gurih dan mengenyangkan.',
    category: 'Snack',
    price: 14000,
    cost: 5500,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28be1b70f?w=400&q=80',
  },

  // 🍮 DESSERT
  {
    name: 'Es Krim Vanilla',
    description: '2 scoop es krim vanilla creamy, topping wafer & coklat.',
    category: 'Dessert',
    price: 18000,
    cost: 7000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
  },
  {
    name: 'Brownies',
    description: 'Brownies dark chocolate fudgy, moist dan intens rasanya.',
    category: 'Dessert',
    price: 20000,
    cost: 8000,
    unit: 'slice',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
  },
  {
    name: 'Puding Karamel',
    description: 'Puding lembut saus karamel homemade, manis dan meleleh di mulut.',
    category: 'Dessert',
    price: 15000,
    cost: 6000,
    unit: 'cup',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  },
  {
    name: 'Waffle',
    description: 'Waffle renyah dengan butter, maple syrup, dan buah segar.',
    category: 'Dessert',
    price: 25000,
    cost: 10000,
    unit: 'porsi',
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&q=80',
  },
];

// ============================================================
// APP SETTINGS
// ============================================================
const APP_SETTINGS = [
  { key: 'store_name', value: 'Teman Ngopi' },
  { key: 'store_tagline', value: 'Selalu Ada, Selalu Hangat' },
  { key: 'default_cutoff', value: '22:00' },
  { key: 'tax_rate', value: '0' },
  { key: 'currency', value: 'IDR' },
  { key: 'print_size', value: '80mm' },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function main() {
  console.log('\n☕ ====================================');
  console.log('   TEMAN NGOPI POS — Database Seed');
  console.log('====================================\n');

  // ── 1. BUAT USER DI SUPABASE AUTH ────────────────────────
  console.log('👤 Membuat akun pengguna...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const createdUsers = [];

  for (const userData of USERS) {
    try {
      // Cek apakah user sudah ada di Prisma
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`   ⏭️  Skip (sudah ada): ${userData.email}`);
        createdUsers.push(existing);
        continue;
      }

      // Buat di Supabase Auth
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { name: userData.name, role: userData.role },
      });

      if (error) {
        // Jika user sudah ada di Supabase tapi belum di Prisma
        if (error.message.includes('already been registered')) {
          console.log(`   ⚠️  Supabase user sudah ada: ${userData.email}, mencari ID...`);
          const { data: listData } = await supabase.auth.admin.listUsers();
          const found = listData?.users?.find(u => u.email === userData.email);
          if (found) {
            const prismaUser = await prisma.user.create({
              data: {
                id: found.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                isActive: true,
              },
            });
            console.log(`   ✅ Terhubung: ${userData.name} (${userData.role})`);
            createdUsers.push(prismaUser);
          }
        } else {
          console.error(`   ❌ Error membuat ${userData.email}:`, error.message);
        }
        continue;
      }

      // Simpan ke Prisma
      const prismaUser = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isActive: true,
        },
      });

      console.log(`   ✅ Dibuat: ${userData.name} (${userData.role}) — ${userData.email}`);
      createdUsers.push(prismaUser);
    } catch (err) {
      console.error(`   ❌ Gagal membuat user ${userData.email}:`, err.message);
    }
  }

  // ── 2. BUAT KATEGORI ─────────────────────────────────────
  console.log('\n🏷️  Membuat kategori produk...');

  const DEFAULT_CATEGORIES = [
    { name: 'Kopi',     icon: '☕', color: '#8B4513', sortOrder: 0 },
    { name: 'Non-Kopi', icon: '🧃', color: '#059669', sortOrder: 1 },
    { name: 'Makanan',  icon: '🍱', color: '#DC2626', sortOrder: 2 },
    { name: 'Snack',    icon: '🍪', color: '#D97706', sortOrder: 3 },
    { name: 'Dessert',  icon: '🍮', color: '#7C3AED', sortOrder: 4 },
  ];

  const categoryMap = {};
  for (const catData of DEFAULT_CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { name: catData.name },
      create: { ...catData, isActive: true },
      update: { icon: catData.icon, color: catData.color, sortOrder: catData.sortOrder },
    });
    categoryMap[cat.name] = cat;
    console.log(`   ✅ ${cat.icon} ${cat.name}`);
  }

  // ── 3. BUAT PRODUK ────────────────────────────────────────
  console.log('\n🍽️  Membuat data produk...');

  const createdProducts = [];
  for (const productData of PRODUCTS) {
    try {
      const existing = await prisma.product.findFirst({
        where: { name: productData.name, category: productData.category },
      });

      if (existing) {
        console.log(`   ⏭️  Skip (sudah ada): ${productData.name}`);
        createdProducts.push(existing);
        continue;
      }

      const cat = categoryMap[productData.category];
      const product = await prisma.product.create({
        data: {
          ...productData,
          categoryId: cat?.id || null,
        },
      });
      console.log(`   ✅ ${product.category.padEnd(10)} | ${product.name.padEnd(25)} | Rp ${product.price.toLocaleString('id-ID')}`);
      createdProducts.push(product);
    } catch (err) {
      console.error(`   ❌ Gagal buat produk ${productData.name}:`, err.message);
    }
  }

  // ── 4. APP SETTINGS ───────────────────────────────────────
  console.log('\n⚙️  Menyimpan pengaturan aplikasi...');

  for (const setting of APP_SETTINGS) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      create: setting,
      update: { value: setting.value },
    });
  }
  console.log(`   ✅ ${APP_SETTINGS.length} pengaturan disimpan`);

  // ── 5. SAMPLE BUKU KAS ────────────────────────────────────
  const owner = createdUsers.find(u => u.role === 'OWNER');
  if (owner) {
    console.log('\n📚 Membuat sample buku kas...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingBook = await prisma.cashBook.findUnique({
      where: { date: today },
    });

    if (!existingBook) {
      const cashBook = await prisma.cashBook.create({
        data: {
          date: today,
          ownerId: owner.id,
          initialCapital: 500000,
          totalCash: 0,
          totalNonCash: 0,
          totalExpenses: 0,
          finalBalance: 0,
          cutOffTime: '22:00',
          isClosed: false,
        },
      });
      console.log(`   ✅ Buku kas hari ini dibuat (Modal: Rp 500.000)`);

      // ── 5. SAMPLE TRANSAKSI ───────────────────────────────
      const kasir = createdUsers.find(u => u.role === 'KASIR') || owner;

      console.log('\n🧾 Membuat sample transaksi...');

      const sampleTransactions = [
        {
          items: [
            { product: 'Kopi Hitam', qty: 2 },
            { product: 'Roti Bakar Coklat', qty: 1 },
          ],
          paymentMethod: 'TUNAI',
        },
        {
          items: [
            { product: 'Cappuccino', qty: 1 },
            { product: 'Croissant Butter', qty: 2 },
          ],
          paymentMethod: 'NON_TUNAI',
        },
        {
          items: [
            { product: 'Matcha Latte', qty: 2 },
            { product: 'Brownies', qty: 1 },
            { product: 'Es Teh Manis', qty: 1 },
          ],
          paymentMethod: 'TUNAI',
        },
        {
          items: [
            { product: 'Nasi Goreng Spesial', qty: 2 },
            { product: 'Kopi Susu', qty: 2 },
          ],
          paymentMethod: 'NON_TUNAI',
        },
        {
          items: [
            { product: 'V60 Pour Over', qty: 1 },
            { product: 'Waffle', qty: 1 },
          ],
          paymentMethod: 'TUNAI',
        },
      ];

      let totalCash = 0;
      let totalNonCash = 0;
      const productMap = {};
      createdProducts.forEach(p => { productMap[p.name] = p; });

      for (let i = 0; i < sampleTransactions.length; i++) {
        const txn = sampleTransactions[i];
        const now = new Date();
        const invoiceNumber = `TN${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`;

        const itemsData = txn.items
          .map(({ product, qty }) => {
            const p = productMap[product];
            if (!p) return null;
            return { product: p, qty };
          })
          .filter(Boolean);

        if (itemsData.length === 0) continue;

        const subtotal = itemsData.reduce((s, { product, qty }) => s + product.price * qty, 0);
        const total = subtotal;
        const amountPaid = txn.paymentMethod === 'TUNAI' ? Math.ceil(total / 5000) * 5000 : total;
        const change = amountPaid - total;

        const transaction = await prisma.transaction.create({
          data: {
            invoiceNumber,
            cashierId: kasir.id,
            cashBookId: cashBook.id,
            subtotal,
            tax: 0,
            discount: 0,
            total,
            paymentMethod: txn.paymentMethod,
            amountPaid,
            change,
            status: 'COMPLETED',
            isGantung: false,
            items: {
              create: itemsData.map(({ product, qty }) => ({
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: qty,
                subtotal: product.price * qty,
              })),
            },
          },
        });

        // Buat jurnal akuntansi
        await prisma.accountingJournal.create({
          data: {
            transactionId: transaction.id,
            date: new Date(),
            description: `Penjualan - ${invoiceNumber}`,
            debitAccount: txn.paymentMethod === 'TUNAI' ? 'Kas' : 'Bank',
            creditAccount: 'Pendapatan Penjualan',
            amount: total,
          },
        });

        if (txn.paymentMethod === 'TUNAI') totalCash += total;
        else totalNonCash += total;

        console.log(`   ✅ ${invoiceNumber} | ${txn.paymentMethod.padEnd(10)} | Rp ${total.toLocaleString('id-ID')}`);
      }

      // ── 6. SAMPLE PENGELUARAN ─────────────────────────────
      console.log('\n💸 Membuat sample pengeluaran...');

      const expenses = [
        { description: 'Beli bahan baku kopi', amount: 150000, category: 'Bahan Baku' },
        { description: 'Beli susu UHT', amount: 80000, category: 'Bahan Baku' },
        { description: 'Listrik harian', amount: 50000, category: 'Utilitas' },
      ];

      let totalExpenses = 0;
      for (const exp of expenses) {
        const expense = await prisma.expense.create({
          data: {
            cashBookId: cashBook.id,
            description: exp.description,
            amount: exp.amount,
            category: exp.category,
          },
        });

        await prisma.accountingJournal.create({
          data: {
            expenseId: expense.id,
            date: new Date(),
            description: `Pengeluaran - ${exp.description}`,
            debitAccount: `Beban ${exp.category}`,
            creditAccount: 'Kas',
            amount: exp.amount,
          },
        });

        totalExpenses += exp.amount;
        console.log(`   ✅ ${exp.category.padEnd(15)} | ${exp.description.padEnd(25)} | Rp ${exp.amount.toLocaleString('id-ID')}`);
      }

      // Update totals di buku kas
      const finalBalance = 500000 + totalCash - totalExpenses;
      await prisma.cashBook.update({
        where: { id: cashBook.id },
        data: { totalCash, totalNonCash, totalExpenses, finalBalance },
      });

      console.log(`\n   📊 Ringkasan Buku Kas:`);
      console.log(`      Modal Awal   : Rp 500.000`);
      console.log(`      Tunai        : Rp ${totalCash.toLocaleString('id-ID')}`);
      console.log(`      Non Tunai    : Rp ${totalNonCash.toLocaleString('id-ID')}`);
      console.log(`      Pengeluaran  : Rp ${totalExpenses.toLocaleString('id-ID')}`);
      console.log(`      Saldo Akhir  : Rp ${finalBalance.toLocaleString('id-ID')}`);
    } else {
      console.log('   ⏭️  Buku kas hari ini sudah ada, skip sample transaksi');
    }
  }

  // ── SELESAI ───────────────────────────────────────────────
  console.log('\n☕ ====================================');
  console.log('   Seed selesai! 🎉');
  console.log('====================================');
  console.log('\n📋 AKUN LOGIN:');
  USERS.forEach(u => {
    console.log(`   ${u.role.padEnd(6)} | ${u.email.padEnd(30)} | Password: ${u.password}`);
  });
  console.log('\n🌐 Akses aplikasi di: http://localhost:3000\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
