// src/app/api/open-bills/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { id } = await params;
    const body = await request.json();

    const bill = await prisma.openBill.update({
      where: { id },
      data: {
        status:       body.status       !== undefined ? body.status       : undefined,
        tableNumber:  body.tableNumber  !== undefined ? body.tableNumber  : undefined,
        customerName: body.customerName !== undefined ? body.customerName : undefined,
        notes:        body.notes        !== undefined ? body.notes        : undefined,
      },
    });
    return NextResponse.json(bill);
  } catch (err) {
    console.error('[open-bills/[id] PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
