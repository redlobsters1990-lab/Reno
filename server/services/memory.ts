import { prisma } from "@/server/db";
import type { MemoryStatus } from "@prisma/client";

export class MemoryService {
  static async getUserLongTermMemory(userId: string, limit = 20) {
    const memories = await prisma.userLongTermMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return memories;
  }

  static async getProjectShortTermMemory(projectId: string, status: MemoryStatus = "active", limit = 20) {
    const memories = await prisma.projectShortTermMemory.findMany({
      where: { projectId, status },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return memories;
  }

  static async classifyAndWrite(
    userId: string,
    projectId: string,
    message: string,
    assistantReply?: string,
  ) {
    const classifier = new MemoryClassifier();
    const classification = classifier.classify(message, assistantReply);

    if (classification.type === "long_term") {
      await this.writeLongTermMemory(userId, classification.key, classification.value);
    } else if (classification.type === "short_term") {
      await this.writeShortTermMemory(userId, projectId, classification.memoryType, classification.note);
    }
    // If trivial, do nothing
  }

  static async writeLongTermMemory(userId: string, key: string, value: string, confidence = 0.7) {
    const existing = await prisma.userLongTermMemory.findUnique({
      where: { userId_memoryKey: { userId, memoryKey: key } },
    });

    if (existing) {
      return await prisma.userLongTermMemory.update({
        where: { id: existing.id },
        data: {
          memoryValue: value,
          confidence,
          updatedAt: new Date(),
        },
      });
    }

    return await prisma.userLongTermMemory.create({
      data: {
        userId,
        memoryKey: key,
        memoryValue: value,
        confidence,
        source: "chat_classifier",
      },
    });
  }

  static async writeShortTermMemory(
    userId: string,
    projectId: string,
    memoryType: string,
    note: string,
    status: MemoryStatus = "active",
  ) {
    return await prisma.projectShortTermMemory.create({
      data: {
        userId,
        projectId,
        memoryType,
        note,
        status,
      },
    });
  }

  static async resolveMemory(memoryId: string, userId: string) {
    const memory = await prisma.projectShortTermMemory.findFirst({
      where: { id: memoryId, userId },
    });

    if (!memory) {
      throw new Error("Memory not found");
    }

    return await prisma.projectShortTermMemory.update({
      where: { id: memoryId },
      data: { status: "resolved" },
    });
  }
}

class MemoryClassifier {
  private longTermPatterns = [
    { pattern: /(prefer|like|love|dislike|hate).*(style|design|color|material)/i, key: "style_preference" },
    { pattern: /(budget|cost|price).*(range|limit|max|maximum)/i, key: "budget_posture" },
    { pattern: /(family|children|kids|baby|elderly)/i, key: "family_constraints" },
    { pattern: /(safety|secure|childproof|pet)/i, key: "safety_preferences" },
    { pattern: /(communicat|talk|update|notify)/i, key: "communication_preference" },
  ];

  private shortTermPatterns = [
    { pattern: /(assum|guess|think|believe).*(dimension|size|layout)/i, type: "design_assumption" },
    { pattern: /(decid|choose|pick|select|option)/i, type: "unresolved_decision" },
    { pattern: /(quote|estimate|price|cost).*(issue|problem|concern|missing)/i, type: "quote_issue" },
    { pattern: /(priority|important|focus|main).*(room|area|space)/i, type: "room_priority" },
  ];

  private trivialPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
    /^(thanks|thank you|cheers|appreciate)/i,
    /^(ok|okay|sure|yes|no|maybe)/i,
    /^.{0,20}$/, // Very short messages
  ];

  classify(message: string, assistantReply?: string): {
    type: "long_term" | "short_term" | "trivial";
    key?: string;
    value?: string;
    memoryType?: string;
    note?: string;
  } {
    const lower = message.toLowerCase();

    // Check trivial first
    for (const pattern of this.trivialPatterns) {
      if (pattern.test(lower)) {
        return { type: "trivial" };
      }
    }

    // Check long-term patterns
    for (const { pattern, key } of this.longTermPatterns) {
      if (pattern.test(lower)) {
        return {
          type: "long_term",
          key,
          value: message,
        };
      }
    }

    // Check short-term patterns
    for (const { pattern, type } of this.shortTermPatterns) {
      if (pattern.test(lower)) {
        return {
          type: "short_term",
          memoryType: type,
          note: message,
        };
      }
    }

    // If assistant reply suggests a decision or assumption, treat as short-term
    if (assistantReply) {
      const replyLower = assistantReply.toLowerCase();
      if (replyLower.includes("assume") || replyLower.includes("decision") || replyLower.includes("prefer")) {
        return {
          type: "short_term",
          memoryType: "inferred_assumption",
          note: `${message} → ${assistantReply.substring(0, 100)}...`,
        };
      }
    }

    // Default: treat as short-term if not trivial
    return {
      type: "short_term",
      memoryType: "general_note",
      note: message,
    };
  }
}
