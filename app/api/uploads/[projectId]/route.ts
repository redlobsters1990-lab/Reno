import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { UploadService } from "@/server/services/upload";

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
    const files = await UploadService.listFiles(projectId, session.user.id);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error("GET /api/uploads/[projectId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
