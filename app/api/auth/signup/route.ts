import { NextRequest, NextResponse } from "next/server";
import { signUpUser } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await signUpUser(body);
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign up failed" },
      { status: 400 },
    );
  }
}
