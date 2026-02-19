// src/app/api/products/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const products = await prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error('[products GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        imageUrl: body.imageUrl,
        isAvailable: body.isAvailable ?? true,
        stock: body.stock,
        unit: body.unit || 'pcs',
        cost: body.cost || 0,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('[products POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
