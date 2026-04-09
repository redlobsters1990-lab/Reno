import { NextResponse, NextRequest } from "next/server";
import { securityMiddleware } from "./proxy.security";

console.log("Middleware module loaded");

export default async function middleware(request: NextRequest) {
  console.log(`Proxy: ${request.method} ${request.nextUrl.pathname} called`);
  
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
    const cookies = Array.from(request.cookies.getAll());
    console.log(`Middleware: ${request.method} ${pathname}, cookies:`, cookies.map(c => c.name));
    const hasAuthCookie = cookies.some(
      cookie => cookie.name.includes("authjs") || cookie.name === "auth-token"
    );
    
    if (!hasAuthCookie) {
      console.log(`Middleware: No auth cookie for ${pathname}`);
      // For API routes, let the API handle authentication (they have better error messages)
      if (pathname.startsWith("/api/")) {
        console.log(`Middleware: API route ${pathname} - skipping auth check, letting API handle`);
        return NextResponse.next();
      }
      // Redirect to signin page for page routes
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(signInUrl);
    }
    console.log(`Middleware: Auth cookie found for ${pathname}`);
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
