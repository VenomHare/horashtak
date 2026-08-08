import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('Auth callback:', { code, error, errorDescription });

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL('/download?error=' + encodeURIComponent(error || 'auth_failed'), requestUrl.origin));
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Exchange code error:', error);
        return NextResponse.redirect(new URL('/download?error=exchange_failed', requestUrl.origin));
      }
      
      console.log('Session exchanged successfully');
    } catch (error) {
      console.error('Session exchange exception:', error);
      return NextResponse.redirect(new URL('/download?error=exchange_exception', requestUrl.origin));
    }
  }

  // URL to redirect to after sign in process completes
  const redirectUrl = new URL('/download', requestUrl.origin);
  console.log('Redirecting to:', redirectUrl.toString());
  
  return redirect(redirectUrl.toString());
}
