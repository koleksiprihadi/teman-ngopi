// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { createServerClient } from '@/lib/supabase/client';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const prismaUpdates = {};
    const supabaseUpdates = {};

    // ── Field yang di-update Prisma ──
    if (body.name      !== undefined) { prismaUpdates.name     = body.name; }
    if (body.email     !== undefined) { prismaUpdates.email    = body.email; }
    if (body.role      !== undefined) { prismaUpdates.role     = body.role; }
    if (body.isActive  !== undefined) { prismaUpdates.isActive = body.isActive; }

    // ── Field yang di-update Supabase Auth ──
    if (body.email     !== undefined) { supabaseUpdates.email    = body.email; }
    if (body.password  !== undefined && body.password !== '') {
      supabaseUpdates.password = body.password;
    }

    // Update Supabase Auth jika ada perubahan email / password
    if (Object.keys(supabaseUpdates).length > 0) {
      const supabase = createServerClient();
      const { error } = await supabase.auth.admin.updateUserById(id, supabaseUpdates);
      if (error) {
        return NextResponse.json(
          { error: error.message, message: error.message },
          { status: 400 }
        );
      }
    }

    // Update Prisma
    if (Object.keys(prismaUpdates).length > 0) {
      const user = await prisma.user.update({
        where: { id },
        data: prismaUpdates,
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });
      return NextResponse.json(user);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Cek role — owner tidak boleh dihapus
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan' }, { status: 404 });
    }
    if (user.role === 'OWNER') {
      return NextResponse.json({ message: 'Akun Owner tidak dapat dihapus' }, { status: 403 });
    }

    // Hapus dari Supabase Auth
    const supabase = createServerClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Hapus dari Prisma
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, message: err.message },
      { status: 500 }
    );
  }
}
