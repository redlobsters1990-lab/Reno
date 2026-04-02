import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { env } from "@/lib/env";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { fileId } = await params;
    
    const file = await prisma.uploadedFile.findFirst({
      where: { id: fileId },
      include: { project: true },
    });
    
    if (!file || file.project.userId !== session.user.id) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    // Build full path
    const fullPath = path.join(env.FILE_STORAGE_ROOT, file.filePath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }
    
    // Read file
    const fileBuffer = await fs.readFile(fullPath);
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.originalName)}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/files/[fileId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
