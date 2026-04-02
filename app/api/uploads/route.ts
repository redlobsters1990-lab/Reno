import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { UploadService } from "@/server/services/upload";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const fileType = formData.get("fileType") as string;
    const file = formData.get("file") as File;
    
    if (!projectId || !fileType || !file) {
      return NextResponse.json(
        { error: "projectId, fileType, and file are required" },
        { status: 400 },
      );
    }
    
    const uploadedFile = await UploadService.uploadFile(
      session.user.id,
      projectId,
      fileType as any,
      file,
    );
    
    return NextResponse.json({ file: uploadedFile }, { status: 201 });
  } catch (error) {
    console.error("POST /api/uploads error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
