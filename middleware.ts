import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
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
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/projects/:path*",
    "/api/chat/:path*",
    "/api/estimates/:path*",
    "/api/quotes/:path*",
    "/api/uploads/:path*",
    "/api/files/:path*",
  ],
};
