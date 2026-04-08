import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyUserAuth } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) return authResponse;

    const project = await prisma.project.findFirst({
      where: { id, userId }, // ownership check
      select: {
        id: true,
        title: true,
        propertyType: true,
        roomCount: true,
        budget: true,
        stylePreference: true,
        notes: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have access to it." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to load project. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) return authResponse;

    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have access to it." },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 500 }
    );
  }
}
