import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import { securityMiddleware } from "./middleware.security";

export default function middleware(request: NextRequest) {
  // Apply security middleware to all requests
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }
  
  // Apply authentication middleware to protected routes
  return withAuth(
    function authMiddleware(req) {
      return NextResponse.next();
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
      pages: {
        signIn: "/auth/signin",
      },
    }
  )(request);
}

export const config = {
  matcher: [
    "/:path*", // Apply to all routes
  ],
};
