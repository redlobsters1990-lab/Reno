import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { EstimateService } from "@/server/services/estimate";

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
    const estimates = await EstimateService.listEstimates(projectId, session.user.id);
    
    return NextResponse.json({ estimates });
  } catch (error) {
    console.error("GET /api/estimates/[projectId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
