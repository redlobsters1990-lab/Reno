import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/files/quotes/[projectId]/[filename] - Serve uploaded quote files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const [projectId, filename] = resolvedParams.path || [];

    if (!projectId || !filename) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Security: Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Invalid filename" },
        { status: 400 }
      );
    }

    const candidatePaths = [
      join(process.cwd(), "uploads", "quotes", projectId, filename),
      join("/tmp", "renovation-advisor", "uploads", "quotes", projectId, filename),
      join("/var/tmp", "renovation-advisor", "uploads", "quotes", projectId, filename),
    ];

    let filepath = "";
    for (const candidate of candidatePaths) {
      if (existsSync(candidate)) {
        filepath = candidate;
        break;
      }
    }

    if (!filepath) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Security: ensure file path ends up in allowed quote directories
    const allowedRoots = [
      join(process.cwd(), "uploads", "quotes"),
      join("/tmp", "renovation-advisor", "uploads", "quotes"),
      join("/var/tmp", "renovation-advisor", "uploads", "quotes"),
    ];
    if (!allowedRoots.some(root => filepath.startsWith(root))) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const fileBuffer = await readFile(filepath);

    // Determine content type
    const ext = filename.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };
    const contentType = contentTypeMap[ext || ""] || "application/octet-stream";

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
