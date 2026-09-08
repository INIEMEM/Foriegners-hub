import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Updates the Supabase session inside Next.js middleware.
 * This must be called on every request so that sessions don't expire silently.
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  
  // Protect /dashboard and /admin routes
  // (We removed /rent from here so that /rent/request can be accessed without logging in. Individual /rent sub-pages handle their own auth).
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin')) {
    if (!user) {
      url.searchParams.set("next", url.pathname);
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith('/dashboard')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'ADMIN') {
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    }
    
    // For /admin routes, check if user is admin
    if (url.pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (!profile || profile.role !== 'ADMIN') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (url.pathname === '/login' && user) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
