// src/app/api/upload/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { createServerClient } = await import('@/lib/supabase/client');
    const supabase = createServerClient();

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' }, { status: 400 });
    }

    // Validasi ukuran file (max 3MB)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Ukuran file maksimal 3MB' }, { status: 400 });
    }

    // Generate nama file unik
    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Convert File ke ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload ke Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[upload] Supabase error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Ambil public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    console.error('[upload POST]', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// Hapus gambar lama dari storage
export async function DELETE(request) {
  try {
    const { createServerClient } = await import('@/lib/supabase/client');
    const supabase = createServerClient();
    const { path } = await request.json();

    if (!path) return NextResponse.json({ message: 'Path diperlukan' }, { status: 400 });

    // Hanya hapus file dari bucket product-images
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[upload DELETE]', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
