import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    console.log('Auth callback received:', {
      code: code ? 'exists' : 'missing',
      next,
      url: request.url,
    });

    if (code) {
      const supabase = await createClient();
      console.log('Exchanging code for session...');

      const {error} = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Code exchange error:', error);
        return NextResponse.redirect(
          new URL('/login?error=auth_callback_failed', request.url)
        );
      }

      // Get the session to ensure it was properly set
      console.log('Getting session after code exchange...');
      const {
        data: {session},
      } = await supabase.auth.getSession();

      console.log('Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (!session) {
        console.error('No session after code exchange');
        return NextResponse.redirect(
          new URL('/login?error=no_session', request.url)
        );
      }
    }

    console.log('Redirecting to:', next);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=auth_callback_failed', request.url)
    );
  }
}
