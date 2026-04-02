import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { QuoteService } from "@/server/services/quote";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    if (!body.projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    
    const quote = await QuoteService.createQuote(
      session.user.id,
      body.projectId,
      body,
    );
    
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
