import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminDb } from '@/lib/db/admin-client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Fetching user for:', user.id, user.email);

    // Check if user exists in custom users table using adminDb to bypass RLS
    let customUser = await adminDb.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    console.log('Existing user found:', customUser);

    // If user doesn't exist, create them using adminDb to bypass RLS
    if (!customUser) {
      console.log('Creating new user in custom users table');
      const [newUser] = await adminDb.insert(users).values({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
        isAdmin: false,
        isApproved: false,
      }).returning();

      console.log('New user created:', newUser);
      customUser = newUser;
    }

    return NextResponse.json(customUser);
  } catch (error) {
    console.error('Error in /api/auth/user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
