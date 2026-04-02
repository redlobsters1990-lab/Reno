import { prisma } from "@/server/db";
import { quoteCreateSchema } from "@/lib/schemas";
import type { QuoteStatus } from "@prisma/client";

export class QuoteService {
  static async createQuote(
    userId: string,
    projectId: string,
    data: unknown,
  ) {
    const validated = quoteCreateSchema.parse(data);
    
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const quote = await prisma.contractorQuote.create({
      data: {
        projectId,
        contractorName: validated.contractorName,
        totalAmount: validated.totalAmount ?? undefined,
        notes: validated.notes ?? undefined,
        status: "draft",
      },
    });
    
    return quote;
  }
  
  static async listQuotes(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const quotes = await prisma.contractorQuote.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        lineItems: true,
      },
    });
    
    return quotes;
  }
  
  static async updateQuote(
    userId: string,
    quoteId: string,
    data: Partial<{
      contractorName: string;
      totalAmount: number | null;
      notes: string | null;
      status: QuoteStatus;
      parsingSummary: string | null;
      warnings: string | null;
    }>,
  ) {
    const quote = await prisma.contractorQuote.findFirst({
      where: { id: quoteId },
      include: { project: true },
    });
    
    if (!quote || quote.project.userId !== userId) {
      throw new Error("Quote not found");
    }
    
    const updated = await prisma.contractorQuote.update({
      where: { id: quoteId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    return updated;
  }
  
  static async addLineItem(
    userId: string,
    quoteId: string,
    data: {
      description: string;
      quantity?: number;
      unit?: string;
      unitPrice?: number;
      totalPrice?: number;
      category?: string;
      notes?: string;
    },
  ) {
    const quote = await prisma.contractorQuote.findFirst({
      where: { id: quoteId },
      include: { project: true },
    });
    
    if (!quote || quote.project.userId !== userId) {
      throw new Error("Quote not found");
    }
    
    const lineItem = await prisma.quoteLineItem.create({
      data: {
        quoteId,
        description: data.description,
        quantity: data.quantity ?? undefined,
        unit: data.unit ?? undefined,
        unitPrice: data.unitPrice ?? undefined,
        totalPrice: data.totalPrice ?? undefined,
        category: data.category ?? undefined,
        notes: data.notes ?? undefined,
      },
    });
    
    return lineItem;
  }
  
  static async analyzeQuoteFromFile(
    userId: string,
    projectId: string,
    fileId: string,
  ) {
    // TODO: Implement OCR parsing
    // For now, create a placeholder quote with warnings
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const file = await prisma.uploadedFile.findFirst({
      where: { id: fileId, projectId },
    });
    
    if (!file) {
      throw new Error("File not found");
    }
    
    const quote = await prisma.contractorQuote.create({
      data: {
        projectId,
        contractorName: "Unknown Contractor",
        status: "parsed",
        parsingSummary: "File uploaded. Manual review required.",
        warnings: "OCR parsing not implemented. Please enter quote details manually.",
      },
    });
    
    return quote;
  }
}
