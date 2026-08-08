import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for auth callback to avoid interference
  if (request.nextUrl.pathname === '/api/auth/callback') {
    return response;
  }

  // Only run Supabase middleware for download and admin routes
  if (request.nextUrl.pathname.startsWith('/download') || 
      request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: any) {
            request.cookies.delete(name);
            response.cookies.delete(name, options);
          },
        },
      }
    );

    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
