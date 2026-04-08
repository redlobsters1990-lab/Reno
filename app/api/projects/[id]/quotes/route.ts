import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// GET /api/projects/[id]/quotes - Get all quotes for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    const quotes = await prisma.quote.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, quotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/quotes - Upload a new quote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const formData = await request.formData();
    
    const file = formData.get("file") as File;
    const contractorName = formData.get("contractorName") as string;
    const companyName = formData.get("companyName") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a file to upload" },
        { status: 400 }
      );
    }

    if (!contractorName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter the contractor name" },
        { status: 400 }
      );
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid quote amount" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF, JPG, and PNG are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    let uploadDir: string;
    try {
      uploadDir = join(process.cwd(), "uploads", "quotes", projectId);
      await mkdir(uploadDir, { recursive: true });
    } catch (dirError) {
      console.error("Error creating upload directory:", dirError);
      return NextResponse.json(
        { success: false, error: "Server error: Unable to create upload directory" },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    // Save file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
    } catch (fileError) {
      console.error("Error saving file:", fileError);
      return NextResponse.json(
        { success: false, error: "Failed to save uploaded file. Please try again." },
        { status: 500 }
      );
    }

    // Create relative URL for file access
    const fileUrl = `/api/files/quotes/${projectId}/${filename}`;

    // Save quote to database
    let quote;
    try {
      quote = await prisma.quote.create({
        data: {
          projectId,
          contractorName,
          companyName: companyName || null,
          amount,
          fileUrl,
          fileName: file.name,
          fileType: file.type,
          status: "pending",
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Try to clean up the uploaded file
      try {
        const fs = await import("fs/promises");
        await fs.unlink(filepath);
      } catch (cleanupError) {
        console.error("Error cleaning up file after DB error:", cleanupError);
      }
      return NextResponse.json(
        { success: false, error: "Failed to save quote information. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      quote: {
        id: quote.id,
        contractorName: quote.contractorName,
        companyName: quote.companyName,
        amount: quote.amount,
        fileUrl: quote.fileUrl,
        fileName: quote.fileName,
        status: quote.status,
        createdAt: quote.createdAt,
      }
    });
  } catch (error) {
    console.error("Error uploading quote:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload quote";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
