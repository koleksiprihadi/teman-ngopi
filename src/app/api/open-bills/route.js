// src/app/api/open-bills/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'OPEN';

    const bills = await prisma.openBill.findMany({
      where: { status },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bills);
  } catch (err) {
    console.error('[open-bills GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();

    const bill = await prisma.openBill.create({
      data: {
        id:           body.id || undefined,
        tableNumber:  body.tableNumber  || null,
        customerName: body.customerName || null,
        cashierId:    body.cashierId,
        subtotal:     Number(body.subtotal) || 0,
        total:        Number(body.total)    || 0,
        notes:        body.notes            || null,
        status:       body.status           || 'OPEN',
        createdAt:    body.createdAt ? new Date(body.createdAt) : new Date(),
        items: {
          create: (body.items || []).map(item => ({
            productId:   item.productId,
            productName: item.productName || item.name || 'Produk',
            price:       Number(item.price)    || 0,
            quantity:    Number(item.quantity) || 1,
            subtotal:    Number(item.subtotal) || 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (err) {
    console.error('[open-bills POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
