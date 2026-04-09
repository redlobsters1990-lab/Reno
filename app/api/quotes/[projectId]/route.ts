import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { QuoteService } from "@/server/services/quote";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { projectId } = await params;
    const quotes = await QuoteService.listQuotes(projectId, session.user.id);
    
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("GET /api/quotes/[projectId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
