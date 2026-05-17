import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const supabase = await createClient();
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return NextResponse.json({ success: false, error: 'file required' }, { status: 400 });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Validate file type (optional)
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      // Media
      'video/mp4',
      'audio/mpeg',
      'audio/wav',
      // Archives
      'application/zip',
      'application/x-rar-compressed'
    ];

    // Uncomment to enable file type validation
    // if (!allowedTypes.includes(file.type)) {
    //   return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 });
    // }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('acadion-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('acadion-files')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        path: filePath
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}