import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { adminDb } from '@/lib/db/admin-client';
import { users, accessRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const body = await request.json();
  const { status, userId } = body;

  try {
    // Update request status using admin client
    const [updatedRequest] = await adminDb
      .update(accessRequests)
      .set({
        status,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      })
      .where(eq(accessRequests.id, params.id))
      .returning();

    // If approved, also update user's approval status using admin client
    if (status === 'approved' && userId) {
      await adminDb
        .update(users)
        .set({ isApproved: true })
        .where(eq(users.id, userId));
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
