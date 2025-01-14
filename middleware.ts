import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware processing:', request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({name, value, ...options});
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({name, value: '', ...options});
        },
      },
    }
  );

  // Get authenticated user from Supabase Auth server
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error getting user:', userError);
  }

  console.log('Auth status:', {
    isAuthenticated: !!user,
    path: request.nextUrl.pathname,
    userId: user?.id,
  });

  // If user is not signed in and the current path is not /login or /signup
  // redirect the user to /login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth/callback')
  ) {
    console.log('Redirecting to login - not authenticated');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is signed in and the current path is /login or /signup
  // redirect the user to /dashboard
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup'))
  ) {
    console.log('Redirecting to dashboard - user is authenticated');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
