// src/app/api/users/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error('[users GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { createServerClient } = await import('@/lib/supabase/client');
    const { name, email, password, role } = await request.json();

    const supabase = createServerClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) throw authError;

    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role: role || 'KASIR',
        isActive: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('[users POST]', err);
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}
