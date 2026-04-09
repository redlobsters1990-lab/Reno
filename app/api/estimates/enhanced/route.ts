import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { EstimateService } from "@/server/services/estimate";

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
    
    const estimate = await EstimateService.createEnhancedEstimate(
      session.user.id,
      body.projectId,
      body,
    );
    
    return NextResponse.json({ estimate }, { status: 201 });
  } catch (error) {
    console.error("POST /api/estimates/enhanced error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}