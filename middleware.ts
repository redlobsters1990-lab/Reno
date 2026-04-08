import { NextResponse, NextRequest } from "next/server";
import { securityMiddleware } from "./middleware.security";

export default async function middleware(request: NextRequest) {
  // Apply security middleware to all requests
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }
  
  const { pathname } = request.nextUrl;
  
  // Skip auth pages to prevent redirect loops
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }
  
  // Protect dashboard and project routes
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/api/projects") ||
      pathname.startsWith("/api/chat") ||
      pathname.startsWith("/api/estimates") ||
      pathname.startsWith("/api/quotes") ||
      pathname.startsWith("/api/uploads")) {
    
    // Simple auth check - look for any auth cookie
    const hasAuthCookie = Array.from(request.cookies.getAll()).some(
      cookie => cookie.name.includes("next-auth") || cookie.name === "auth-token"
    );
    
    if (!hasAuthCookie) {
      // Redirect to signin page
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(signInUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only protect specific routes, not all routes
    "/dashboard/:path*",
    "/api/projects/:path*",
    "/api/chat/:path*", 
    "/api/estimates/:path*",
    "/api/quotes/:path*",
    "/api/uploads/:path*",
  ],
};
