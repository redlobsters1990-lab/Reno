import { NextRequest, NextResponse } from "next/server";
import { verifyUserAuth } from "@/lib/auth-utils";
import { prisma } from "@/server/db";
import { EstimateService } from "@/server/services/estimate";

export async function POST(request: NextRequest) {
  try {
    console.log("Enhanced estimate API: checking auth");
    const cookies = request.cookies.getAll();
    console.log("Request cookies:", cookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })));
    
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) {
      console.log("Unauthorized: verifyUserAuth returned response");
      return authResponse;
    }
    console.log("Authenticated user ID:", userId);
    
    const body = await request.json();
    console.log('Enhanced estimate request body:', JSON.stringify(body, null, 2).substring(0, 500));
    
    if (!body.projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    
    const estimate = await EstimateService.createEnhancedEstimate(
      userId,
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