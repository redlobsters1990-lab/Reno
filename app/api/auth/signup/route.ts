import { NextRequest, NextResponse } from "next/server";
import { signUpUser } from "@/server/auth";
import { authLogger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await signUpUser(body, request);
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign up failed";
    
    // Don't log validation errors at error level
    if (!errorMessage.includes('already exists') && !errorMessage.includes('must contain')) {
      console.error("Sign up error:", error);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 },
    );
  }
}
