import { prisma } from "@/server/db";
import { createProjectSchema } from "@/lib/schemas";
import type { ProjectStatus } from "@prisma/client";

export class ProjectService {
  static async create(userId: string, data: unknown) {
    const validated = createProjectSchema.parse(data);

    const project = await prisma.project.create({
      data: {
        userId,
        title: validated.title,
        propertyType: validated.propertyType,
        roomCount: validated.roomCount ?? undefined,
        budget: validated.budget ?? undefined,
        stylePreference: validated.stylePreference ?? undefined,
        notes: validated.notes ?? undefined,
      },
    });

    return project;
  }

  static async list(userId: string, status?: ProjectStatus) {
    const projects = await prisma.project.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            uploadedFiles: true,
            contractorQuotes: true,
            chatMessages: true,
          },
        },
        estimates: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return projects;
  }

  static async get(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        uploadedFiles: {
          orderBy: { createdAt: "desc" },
        },
        contractorQuotes: {
          orderBy: { createdAt: "desc" },
          include: {
            lineItems: true,
          },
        },
        estimates: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        projectMemories: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            chatMessages: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }

  static async update(userId: string, projectId: string, data: Partial<unknown>) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // TODO: Add validation for update fields
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  static async archive(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status: "archived" },
    });

    return updated;
  }
}
