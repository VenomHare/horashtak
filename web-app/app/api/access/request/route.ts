import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, accessRequests } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if user exists using db (subject to RLS)
  const customUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!customUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if already approved
  if (customUser.isApproved) {
    return NextResponse.json({ error: 'User already approved' }, { status: 400 });
  }

  // Check if request already exists using adminDb to bypass RLS
  const existingRequest = await adminDb.query.accessRequests.findFirst({
    where: and(
      eq(accessRequests.userId, user.id),
      eq(accessRequests.status, 'pending')
    ),
  });

  if (existingRequest) {
    return NextResponse.json({ error: 'Request already pending' }, { status: 400 });
  }

  // Create access request using adminDb to bypass RLS
  await adminDb.insert(accessRequests).values({
    userId: user.id,
    status: 'pending',
  });

  return NextResponse.json({ success: true });
}
