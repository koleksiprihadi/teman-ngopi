// src/app/api/sync/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { entity, data } = await request.json();

    let result;

    switch (entity) {
      case 'product':
        result = await prisma.product.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        });
        break;

      case 'transaction':
        const { items, ...txData } = data;
        result = await prisma.transaction.upsert({
          where: { id: txData.id },
          create: {
            ...txData,
            items: { create: items || [] },
          },
          update: txData,
        });
        break;

      case 'cash_book':
        result = await prisma.cashBook.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        });
        break;

      case 'expense':
        result = await prisma.expense.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        });
        break;

      case 'open_bill':
        result = await prisma.openBill.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown entity' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[sync POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
