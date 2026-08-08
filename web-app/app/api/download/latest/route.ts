import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, releases, downloads } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getPresignedUrl } from '@/lib/r2/client';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user is approved using db (subject to RLS)
  const customUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!customUser || !customUser.isApproved) {
    return NextResponse.json({ error: 'User not approved' }, { status: 403 });
  }

  // Get latest release using db (subject to RLS - public can read)
  const [latestRelease] = await db
    .select()
    .from(releases)
    .where(eq(releases.isLatest, true))
    .orderBy(desc(releases.createdAt))
    .limit(1);

  if (!latestRelease) {
    return NextResponse.json({ error: 'No release available' }, { status: 404 });
  }

  // Generate presigned URL
  const downloadUrl = await getPresignedUrl(latestRelease.r2Key, 600); // 10 minutes expiry

  // Log download using adminDb to bypass RLS
  await adminDb.insert(downloads).values({
    userId: user.id,
    releaseId: latestRelease.id,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  });

  // Update user's last download using adminDb to bypass RLS
  await adminDb
    .update(users)
    .set({ lastDownload: new Date() })
    .where(eq(users.id, user.id));

  return NextResponse.json({ downloadUrl });
}
