import { NextRequest, NextResponse } from "next/server";
import { verifyUserAuth } from "@/lib/auth-utils";
import { prisma } from "@/server/db";
import { EstimateService } from "@/server/services/estimate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) {
      return authResponse;
    }
    
    const { projectId } = await params;
    const estimates = await EstimateService.listEstimates(projectId, userId);
    
    return NextResponse.json({ estimates });
  } catch (error) {
    console.error("GET /api/estimates/[projectId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
