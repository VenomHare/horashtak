import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, downloads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

  // Get all downloads using adminDb to bypass RLS (admin needs to see all downloads)
  const allDownloads = await adminDb.query.downloads.findMany({
    with: {
      user: true,
      release: true,
    },
    orderBy: (downloads, { desc }) => [desc(downloads.downloadedAt)],
  });

  return NextResponse.json(allDownloads);
}
