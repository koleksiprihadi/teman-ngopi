// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name:        body.name        !== undefined ? body.name        : undefined,
        description: body.description !== undefined ? body.description : undefined,
        price:       body.price       !== undefined ? Number(body.price) : undefined,
        cost:        body.cost        !== undefined ? Number(body.cost)  : undefined,
        category:    body.category    !== undefined ? body.category    : undefined,
        imageUrl:    body.imageUrl    !== undefined ? body.imageUrl    : undefined,
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : undefined,
        unit:        body.unit        !== undefined ? body.unit        : undefined,
        stock:       body.stock       !== undefined ? body.stock       : undefined,
        updatedAt:   new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }
    console.error('[products/[id] PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }
    console.error('[products/[id] DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
