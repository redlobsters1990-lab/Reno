import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyUserAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) return authResponse;

    const data = await request.json();

    // Field-level validation with clear messages
    if (!data.name || !String(data.name).trim()) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }
    if (!data.propertySize || isNaN(Number(data.propertySize)) || Number(data.propertySize) <= 0) {
      return NextResponse.json(
        { error: "A valid property size (in sqft) is required." },
        { status: 400 }
      );
    }
    if (data.budget && (isNaN(Number(data.budget)) || Number(data.budget) < 0)) {
      return NextResponse.json(
        { error: "Budget must be a positive number." },
        { status: 400 }
      );
    }

    // Build the notes string (includes size for estimate generation)
    const internalPrefix = `Property size: ${data.propertySize} sqft, Rooms: ${data.rooms || "Not specified"}.`;
    const userNotes = data.notes ? ` ${String(data.notes).trim()}` : "";
    const fullNotes = internalPrefix + userNotes;

    const project = await prisma.project.create({
      data: {
        title:           String(data.name).trim(),
        propertyType:    data.propertyType   || "HDB Resale",
        roomCount:       data.rooms          ? parseInt(String(data.rooms))   : null,
        budget:          data.budget         ? parseFloat(String(data.budget)) : null,
        stylePreference: data.stylePreference ? String(data.stylePreference)  : null,
        notes:           fullNotes,
        userId,
      },
      select: {
        id: true, title: true, propertyType: true, createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      project,
      redirect: `/dashboard/projects/${project.id}`,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) return authResponse;

    const projects = await prisma.project.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true, title: true, propertyType: true,
        stylePreference: true, roomCount: true,
        createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to load projects. Please refresh the page." },
      { status: 500 }
    );
  }
}
