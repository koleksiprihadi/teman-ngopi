// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { createServerClient } = await import('@/lib/supabase/client');
    const { id } = params;
    const body = await request.json();

    const prismaUpdates = {};
    const supabaseUpdates = {};

    if (body.name !== undefined)     prismaUpdates.name     = body.name;
    if (body.email !== undefined)    prismaUpdates.email    = body.email;
    if (body.role !== undefined)     prismaUpdates.role     = body.role;
    if (body.isActive !== undefined) prismaUpdates.isActive = body.isActive;
    if (body.email !== undefined)    supabaseUpdates.email  = body.email;
    if (body.password)               supabaseUpdates.password = body.password;

    if (Object.keys(supabaseUpdates).length > 0) {
      const supabase = createServerClient();
      const { error } = await supabase.auth.admin.updateUserById(id, supabaseUpdates);
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: prismaUpdates,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error('[users/[id] PATCH]', err);
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const { createServerClient } = await import('@/lib/supabase/client');
    const { id } = params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ message: 'Pengguna tidak ditemukan' }, { status: 404 });
    if (user.role === 'OWNER') return NextResponse.json({ message: 'Akun Owner tidak dapat dihapus' }, { status: 403 });

    const supabase = createServerClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[users/[id] DELETE]', err);
    return NextResponse.json({ error: err.message, message: err.message }, { status: 500 });
  }
}
