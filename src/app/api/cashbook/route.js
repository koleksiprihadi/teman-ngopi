// src/app/api/cashbook/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where = {};
    if (date) {
      where.date = new Date(date);
    }

    const books = await prisma.cashBook.findMany({
      where,
      include: {
        expenses: true,
        transactions: { select: { total: true, paymentMethod: true, status: true } },
      },
      orderBy: { date: 'desc' },
      take: 31,
    });

    return NextResponse.json(books);
  } catch (err) {
    console.error('[cashbook GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const body = await request.json();
    const book = await prisma.cashBook.create({
      data: {
        date: new Date(body.date),
        ownerId: body.ownerId,
        initialCapital: body.initialCapital,
        cutOffTime: body.cutOffTime || '22:00',
      },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    console.error('[cashbook POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
