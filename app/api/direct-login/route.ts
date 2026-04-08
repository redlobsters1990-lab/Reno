import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Check password
    let passwordValid = false;
    try {
      passwordValid = await compare(password, user.passwordHash);
    } catch (compareError) {
      console.error("Password compare error:", compareError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      redirect: "/dashboard"
    });
    
    // Set simple auth cookie
    // NOT httpOnly so client-side JavaScript can check it
    response.cookies.set({
      name: "auth-token",
      value: `user-${user.id}`,
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    
    // Also set user email in a non-httpOnly cookie for client-side access
    response.cookies.set({
      name: "user-email",
      value: user.email,
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Direct login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
