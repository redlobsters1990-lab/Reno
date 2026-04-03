import { NextResponse, NextRequest } from "next/server";
import { securityMiddleware } from "./middleware.security";

export default async function middleware(request: NextRequest) {
  // Apply security middleware to all requests
  const securityResponse = securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }
  
  // For now, just pass through - we'll add authentication later
  // This avoids the auth import issue while we fix other things
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:path*", // Apply to all routes
  ],
};
