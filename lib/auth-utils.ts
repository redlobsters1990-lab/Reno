import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

// Helper to get user ID from auth cookie
export function getUserIdFromCookie(request: NextRequest): string | null {
  const authCookie = request.cookies.get('auth-token');
  if (!authCookie) return null;
  
  // Extract user ID from cookie value "user-{id}"
  const match = authCookie.value.match(/^user-(.+)$/);
  return match ? match[1] : null;
}

// Try to get user ID from NextAuth session first, fallback to cookie
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const session = await auth();
    if (session?.user?.id) {
      console.log('Auth: got user ID from NextAuth session:', session.user.id);
      return session.user.id;
    }
  } catch (error) {
    console.warn('Failed to get session from auth():', error);
  }
  // Fallback to legacy cookie
  const cookieUserId = getUserIdFromCookie(request);
  if (cookieUserId) {
    console.log('Auth: got user ID from legacy auth-token cookie:', cookieUserId);
  }
  return cookieUserId;
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
  // Use provided prisma instance or import it
  let prisma;
  if (prismaInstance) {
    prisma = prismaInstance;
  } else {
    // Dynamic import to avoid circular dependencies
    const { prisma: importedPrisma } = await import("@/server/db");
    prisma = importedPrisma;
  }
  
  // Try possible user IDs in order of preference
  const possibleUserIds: string[] = [];
  
  // 1. NextAuth session
  try {
    const session = await auth();
    if (session?.user?.id) {
      possibleUserIds.push(session.user.id);
      console.log('Auth: trying session user ID:', session.user.id);
    }
  } catch (error) {
    console.warn('Failed to get session from auth():', error);
  }
  
  // 2. Legacy auth-token cookie
  const cookieUserId = getUserIdFromCookie(request);
  if (cookieUserId) {
    possibleUserIds.push(cookieUserId);
    console.log('Auth: trying cookie user ID:', cookieUserId);
  }
  
  // Try each ID until we find a valid user
  for (const candidateId of possibleUserIds) {
    const user = await prisma.user.findUnique({
      where: { id: candidateId },
      select: { id: true },
    });
    if (user) {
      console.log('Auth: validated user ID:', candidateId);
      return { userId: candidateId, response: undefined };
    } else {
      console.log('Auth: user ID not found in database:', candidateId);
    }
  }
  
  // No valid user found
  const response = NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
  clearAllAuthCookies(response);
  return { userId: "", response };
}