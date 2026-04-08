import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { writeFile, mkdir, access, unlink } from "fs/promises";
import { join } from "path";
import { constants } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const projectId = resolvedParams?.id;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Invalid project ID" }, { status: 400 });
    }

    const quotes = await prisma.contractorQuote.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    const normalizedQuotes = quotes.map((quote) => {
      let meta: any = {};
      try { meta = quote.parsingSummary ? JSON.parse(quote.parsingSummary) : {}; } catch {}
      return {
        ...quote,
        amount: quote.totalAmount,
        companyName: meta.companyName || "",
        fileUrl: meta.fileUrl || "",
        fileName: meta.fileName || "Uploaded quote",
        fileType: meta.fileType || "",
        analysis: meta.analysis || null,
      };
    });

    return NextResponse.json({ success: true, quotes: normalizedQuotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quotes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const projectId = resolvedParams?.id;
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Invalid project ID: parameter is missing" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const contractorName = (formData.get("contractorName") as string | null)?.trim() || "Unknown contractor";
    const companyName = (formData.get("companyName") as string | null)?.trim() || null;
    const amountRaw = (formData.get("amount") as string | null) || "";
    const amount = amountRaw ? parseFloat(amountRaw) : 0;

    if (!file) {
      return NextResponse.json({ success: false, error: "Please select a file to upload" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Only PDF, JPG, and PNG are allowed" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    let uploadDir = "";
    const possibleDirs = [
      join(process.cwd(), "uploads", "quotes", projectId),
      join("/tmp", "renovation-advisor", "uploads", "quotes", projectId),
      join("/var/tmp", "renovation-advisor", "uploads", "quotes", projectId),
    ];
    for (const dir of possibleDirs) {
      try {
        await mkdir(dir, { recursive: true });
        const testFile = join(dir, ".write-test");
        await writeFile(testFile, "test");
        await access(testFile, constants.W_OK);
        await unlink(testFile);
        uploadDir = dir;
        break;
      } catch {
        continue;
      }
    }
    if (!uploadDir) {
      return NextResponse.json({ success: false, error: "Server error: Unable to create upload directory. All fallback locations failed." }, { status: 500 });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    try {
      const bytes = await file.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));
    } catch (fileError) {
      console.error("Error saving file:", fileError);
      return NextResponse.json({ success: false, error: "Failed to save uploaded file. Please try again." }, { status: 500 });
    }

    const fileUrl = `/api/files/quotes/${projectId}/${filename}`;

    try {
      const quote = await prisma.contractorQuote.create({
        data: {
          projectId,
          userId: project.userId,
          contractorName,
          totalAmount: amount,
          status: "draft",
          parsingSummary: JSON.stringify({
            companyName,
            fileUrl,
            fileName: file.name,
            fileType: file.type,
            storagePath: filepath,
            uploadedAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        quote: {
          id: quote.id,
          contractorName: quote.contractorName,
          companyName,
          amount,
          totalAmount: quote.totalAmount,
          fileUrl,
          fileName: file.name,
          fileType: file.type,
          status: "pending",
          createdAt: quote.createdAt,
          analysis: null,
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      try { await unlink(filepath); } catch {}
      return NextResponse.json({ success: false, error: "Failed to save quote information. Please try again." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error uploading quote:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload quote";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
