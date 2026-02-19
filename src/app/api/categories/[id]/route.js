// src/app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = params;
    const body = await request.json();

    const data = {};
    if (body.name      !== undefined) data.name      = body.name;
    if (body.icon      !== undefined) data.icon      = body.icon;
    if (body.color     !== undefined) data.color     = body.color;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive  !== undefined) data.isActive  = body.isActive;

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    // Jika nama berubah, update semua produk di kategori ini
    if (body.name && body.oldName) {
      await prisma.product.updateMany({
        where: { category: body.oldName },
        data: { category: body.name },
      });
    }

    return NextResponse.json(category);
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ message: 'Nama kategori sudah ada' }, { status: 400 });
    }
    console.error('[categories/[id] PATCH]', err);
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = params;

    // Cek apakah ada produk yang memakai kategori ini
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const productCount = await prisma.product.count({
      where: { category: category.name },
    });

    if (productCount > 0) {
      return NextResponse.json({
        message: `Tidak bisa dihapus — ada ${productCount} produk di kategori ini. Pindahkan produk dulu.`,
        productCount,
      }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[categories/[id] DELETE]', err);
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}
