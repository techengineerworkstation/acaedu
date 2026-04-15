import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!('user' in authResult)) return authResult;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'file required' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${folder}/${authResult.user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Firebase Storage
    if (!storage) {
      return NextResponse.json({ success: false, error: 'Firebase storage not configured' }, { status: 500 });
    }
    const storageRef = ref(storage, filename);
    const buffer = await file.arrayBuffer();
    const snapshot = await uploadBytes(storageRef, new Uint8Array(buffer), {
      contentType: file.type
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);

    return NextResponse.json({
      success: true,
      data: {
        url: downloadUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        path: filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
