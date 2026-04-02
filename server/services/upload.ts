import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/server/db";
import { env } from "@/lib/env";
import type { FileType } from "@prisma/client";

export class UploadService {
  static async uploadFile(
    userId: string,
    projectId: string,
    fileType: FileType,
    file: File,
  ) {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Create storage directory
    const projectDir = path.join(env.FILE_STORAGE_ROOT, projectId);
    await fs.mkdir(projectDir, { recursive: true });

    // Generate safe filename
    const timestamp = Date.now();
    const ext = path.extname(file.name) || ".bin";
    const safeName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(projectDir, safeName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Store metadata - store relative path from storage root
    const relativePath = path.relative(env.FILE_STORAGE_ROOT, filePath);
    
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        projectId,
        fileType,
        filePath: relativePath,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: buffer.length,
      },
    });

    return uploadedFile;
  }

  static async listFiles(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const files = await prisma.uploadedFile.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return files;
  }

  static async getFileUrl(fileId: string, userId: string) {
    const file = await prisma.uploadedFile.findFirst({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.project.userId !== userId) {
      throw new Error("File not found");
    }

    // In production, this would be a signed URL to S3/R2
    // For local dev, serve via API route
    return `/api/files/${fileId}`;
  }

  static async deleteFile(fileId: string, userId: string) {
    const file = await prisma.uploadedFile.findFirst({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.project.userId !== userId) {
      throw new Error("File not found");
    }

    // Delete physical file
    const fullPath = path.join(env.FILE_STORAGE_ROOT, file.filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.warn("Failed to delete physical file:", err);
    }

    // Delete DB record
    await prisma.uploadedFile.delete({
      where: { id: fileId },
    });
  }
}
