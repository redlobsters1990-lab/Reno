import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyUserAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) {
      return authResponse; // Returns 401 with cleared cookies
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.propertySize) {
      return NextResponse.json(
        { error: "Project name and property size are required" },
        { status: 400 }
      );
    }
    
    // Create project in database
    const project = await prisma.project.create({
      data: {
        title: data.name,
        notes: `Property size: ${data.propertySize} sqft, Rooms: ${data.rooms || 'Not specified'}. ${data.notes || ''}`,
        propertyType: data.propertyType || "HDB Resale",
        roomCount: data.rooms ? parseInt(data.rooms) : null,
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        propertyType: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      project,
      redirect: `/dashboard/projects/${project.id}`
    });
    
  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const { userId, response: authResponse } = await verifyUserAuth(request, prisma);
    if (authResponse) {
      return authResponse; // Returns 401 with cleared cookies
    }
    
    // Get user's projects
    const projects = await prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        propertyType: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      projects,
    });
    
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}