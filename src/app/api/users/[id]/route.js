// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
