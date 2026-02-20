// src/app/api/transactions/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { searchParams } = new URL(request.url);
    const cashierId = searchParams.get('cashierId');
    const isGantung = searchParams.get('gantung') === 'true';
    const date = searchParams.get('date');

    const where = {};
    if (cashierId) where.cashierId = cashierId;
    if (isGantung) where.isGantung = true;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { items: true, cashier: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error('[transactions GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();

    const tx = await prisma.transaction.create({
      data: {
        id:            body.id || undefined,
        invoiceNumber: body.invoiceNumber,
        cashierId:     body.cashierId,
        cashBookId:    body.cashBookId || null,
        subtotal:      Number(body.subtotal)   || 0,
        tax:           Number(body.tax)        || 0,
        discount:      Number(body.discount)   || 0,
        total:         Number(body.total)      || 0,
        paymentMethod: body.paymentMethod      || 'TUNAI',
        amountPaid:    Number(body.amountPaid) || 0,
        change:        Number(body.change)     || 0,
        status:        body.status             || 'COMPLETED',
        isGantung:     body.isGantung          || false,
        notes:         body.notes              || null,
        createdAt:     body.createdAt ? new Date(body.createdAt) : new Date(),
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

    return NextResponse.json(tx, { status: 201 });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Invoice number duplikat', code: 'DUPLICATE' }, { status: 409 });
    }
    console.error('[transactions POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
