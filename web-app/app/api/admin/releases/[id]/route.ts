import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, releases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { deleteFromR2 } from '@/lib/r2/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user is admin
  const customUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!customUser || !customUser.isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Get release
  const release = await db.query.releases.findFirst({
    where: eq(releases.id, id),
  });

  if (!release) {
    return NextResponse.json({ error: 'Release not found' }, { status: 404 });
  }

  try {
    // Delete from R2
    await deleteFromR2(release.r2Key);

    // Delete from database using admin client
    await adminDb.delete(releases).where(eq(releases.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
