import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatService } from "@/server/services/openclaw";

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
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    
    const messages = await ChatService.getChatHistory(projectId, session.user.id, limit);
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/chat/[projectId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
