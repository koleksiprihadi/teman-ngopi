// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    // Create Supabase auth user
    const supabase = createServerClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (authError) throw authError;

    // Create user in Prisma
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
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}
