import { NextResponse, NextRequest } from "next/server";

// Simple auth middleware that actually works
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require auth
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/api/auth/signup",
    "/api/auth/csrf",
    "/api/auth/session",
    "/api/auth/[...nextauth]",
    "/_next",
    "/favicon.ico",
  ];
  
  // Check if path is public
  const isPublic = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + "/")
  );
  
  if (isPublic) {
    return NextResponse.next();
  }
  
  // For protected paths, check for auth cookie
  // NextAuth v5 uses different cookie names
  const hasAuthCookie = 
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token") ||
    request.cookies.has("auth-token");
  
  if (!hasAuthCookie) {
    // Redirect to signin
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/projects/:path*",
    "/api/chat/:path*",
    "/api/estimates/:path*",
    "/api/quotes/:path*",
    "/api/uploads/:path*",
  ],
};
