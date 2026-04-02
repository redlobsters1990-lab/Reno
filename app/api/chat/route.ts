import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { ChatService } from "@/server/services/openclaw";
import { chatMessageSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = chatMessageSchema.parse(body);
    
    const result = await ChatService.processUserMessage(
      session.user.id,
      validated.projectId,
      validated.message,
    );
    
    return NextResponse.json({
      message: result.assistantMessage,
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
