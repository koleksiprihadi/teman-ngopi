// src/app/api/categories/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error('[categories GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();

    // Hitung sortOrder otomatis jika tidak disertakan
    const lastCat = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
    });
    const nextOrder = (lastCat?.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name: body.name,
        icon: body.icon || '🍽️',
        color: body.color || '#8B4513',
        sortOrder: body.sortOrder ?? nextOrder,
        isActive: true,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ message: 'Nama kategori sudah ada' }, { status: 400 });
    }
    console.error('[categories POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
