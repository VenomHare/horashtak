import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, releases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { uploadToR2 } from '@/lib/r2/client';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user is admin using db (subject to RLS)
  const customUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!customUser || !customUser.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Get all releases using db (subject to RLS - public can read)
  const allReleases = await db.query.releases.findMany({
    orderBy: (releases, { desc }) => [desc(releases.createdAt)],
  });

  return NextResponse.json(allReleases);
}

export async function POST(request: NextRequest) {
  // Handle authentication manually since middleware is skipped for file uploads
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user is admin using db (subject to RLS)
  const customUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!customUser || !customUser.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const version = formData.get('version') as string;
  const changelog = formData.get('changelog') as string;
  const releaseNotes = formData.get('releaseNotes') as string;
  const isProduction = formData.get('isProduction') === 'true';

  if (!file || !version) {
    return NextResponse.json({ error: 'File and version are required' }, { status: 400 });
  }

  try {
    // Upload file to R2 - convert to Buffer to avoid streaming hash calculation issues
    const r2Key = `releases/${version}/${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    await uploadToR2(r2Key, Buffer.from(fileBuffer), 'application/vnd.android.package-archive');

    // If this is marked as production, unmark other releases using adminDb to bypass RLS
    if (isProduction) {
      await adminDb
        .update(releases)
        .set({ isProduction: false })
        .where(eq(releases.isProduction, true));
    }

    // Create release record using adminDb to bypass RLS
    const [newRelease] = await adminDb
      .insert(releases)
      .values({
        version,
        fileName: file.name,
        fileSize: Number(file.size),
        r2Key,
        changelog: changelog || null,
        releaseNotes: releaseNotes || null,
        isProduction,
        createdBy: user.id,
      })
      .returning();

    return NextResponse.json(newRelease);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
