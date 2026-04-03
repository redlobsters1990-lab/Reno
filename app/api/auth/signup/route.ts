import { NextRequest, NextResponse } from "next/server";
import { signUpUser } from "@/server/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await signUpUser(body);
    
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Sign up failed";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 },
    );
  }
}
