// src/app/api/transactions/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request) {
  try {
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
