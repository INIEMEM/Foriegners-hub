import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js middleware — runs on every matched request.
 * Refreshes the Supabase auth session so it never expires silently.
 */
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files and Next.js internals:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico   (browser tab icon)
     * - public files with common image/font extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)",
  ],
};
