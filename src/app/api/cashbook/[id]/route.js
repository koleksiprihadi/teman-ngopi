// src/app/api/cashbook/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = await params;
    const body = await request.json();

    const book = await prisma.cashBook.update({
      where: { id },
      data: {
        totalCash:     body.totalCash     !== undefined ? Number(body.totalCash)     : undefined,
        totalNonCash:  body.totalNonCash  !== undefined ? Number(body.totalNonCash)  : undefined,
        totalExpenses: body.totalExpenses !== undefined ? Number(body.totalExpenses) : undefined,
        finalBalance:  body.finalBalance  !== undefined ? Number(body.finalBalance)  : undefined,
        isClosed:      body.isClosed      !== undefined ? body.isClosed              : undefined,
        closedAt:      body.closedAt      !== undefined ? new Date(body.closedAt)    : undefined,
        notes:         body.notes         !== undefined ? body.notes                 : undefined,
      },
    });
    return NextResponse.json(book);
  } catch (err) {
    console.error('[cashbook/[id] PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
