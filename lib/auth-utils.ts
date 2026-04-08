import { NextRequest, NextResponse } from "next/server";

// Helper to get user ID from auth cookie
export function getUserIdFromCookie(request: NextRequest): string | null {
  const authCookie = request.cookies.get('auth-token');
  if (!authCookie) return null;
  
  // Extract user ID from cookie value "user-{id}"
  const match = authCookie.value.match(/^user-(.+)$/);
  return match ? match[1] : null;
}

// Helper function to clear all auth cookies
export function clearAllAuthCookies(response: NextResponse): NextResponse {
  const authCookieNames = [
    "auth-token",
    "user-email",
    "next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "session",
    "sessionid",
    "token",
    "access_token",
    "refresh_token"
  ];
  
  authCookieNames.forEach(cookieName => {
    response.cookies.delete(cookieName);
    // Also set expired cookie to ensure browser clears it
    response.cookies.set({
      name: cookieName,
      value: "",
      expires: new Date(0), // Expire immediately
      path: "/",
    });
  });
  
  return response;
}

// Helper to verify user exists and handle invalid auth
export async function verifyUserAuth(request: NextRequest, prismaInstance?: any): Promise<{
  userId: string;
  response?: NextResponse; // Only set if auth is invalid
}> {
  const userId = getUserIdFromCookie(request);
  
  if (!userId) {
    const response = NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
    clearAllAuthCookies(response);
    return { userId: "", response };
  }
  
  // Use provided prisma instance or import it
  let prisma;
  if (prismaInstance) {
    prisma = prismaInstance;
  } else {
    // Dynamic import to avoid circular dependencies
    const { prisma: importedPrisma } = await import("@/server/db");
    prisma = importedPrisma;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  
  if (!user) {
    const response = NextResponse.json(
      { error: "Invalid authentication. Please sign in again." },
      { status: 401 }
    );
    clearAllAuthCookies(response);
    return { userId: "", response };
  }
  
  return { userId, response: undefined };
}