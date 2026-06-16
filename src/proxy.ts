import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { tenantSubdomain } from "@/lib/usernames";

// Next.js 16 "proxy" convention (formerly `middleware`). Refreshes the Supabase
// session on each request and enforces coarse route protection.
export function proxy(request: NextRequest) {
  // Wildcard subdomains (`<handle>.lumen.app`) serve only the public profile.
  // Rewrite the apex path to the `[username]` route; everything else (API
  // tracking calls, assets) passes through untouched. No-op until a root
  // domain is configured, so path-based routing keeps working everywhere else.
  const sub = tenantSubdomain(request.headers.get("host") ?? "");
  if (sub) {
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/${sub}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and image files. The public
     * profile pages (`/[username]`) pass through to keep sessions fresh but
     * are never redirected.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
