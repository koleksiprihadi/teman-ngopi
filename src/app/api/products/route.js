// src/app/api/products/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
