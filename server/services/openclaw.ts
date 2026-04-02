import { env } from "@/lib/env";
import { prisma } from "@/server/db";
import { MemoryService } from "./memory";

interface OpenClawMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenClawRequest {
  messages: OpenClawMessage[];
  sessionKey: string;
  model?: string;
  temperature?: number;
}

interface OpenClawResponse {
  content: string;
  sessionKey: string;
  model: string;
}

export class OpenClawClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = env.OPENCLAW_BASE_URL;
    this.apiKey = env.OPENCLAW_API_KEY;
  }

  async sendMessage(request: OpenClawRequest): Promise<OpenClawResponse> {
    // TODO: Implement actual OpenClaw API call
    // For now, return a mock response
    
    console.log("OpenClaw request:", {
      url: `${this.baseUrl}/api/v1/chat`,
      sessionKey: request.sessionKey,
      messageCount: request.messages.length,
    });

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract user's last message for context
      const userMessages = request.messages.filter(m => m.role === "user");
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
      
      // Generate context-aware mock response
      let mockResponse = "I understand you're working on a renovation project. ";
      
      if (lastUserMessage.toLowerCase().includes("kitchen")) {
        mockResponse += "Kitchen renovations are a great investment. I can help you think about layout, materials, and appliances. What's your vision for the space?"
      } else if (lastUserMessage.toLowerCase().includes("bathroom")) {
        mockResponse += "Bathroom renovations require careful planning for waterproofing and fixtures. Are you thinking of a full remodel or just updates?"
      } else if (lastUserMessage.toLowerCase().includes("budget")) {
        mockResponse += "Budget planning is crucial. I can help you estimate costs based on your property type and scope. Would you like me to provide a budget range?"
      } else {
        mockResponse += "Based on our conversation, I can help you think through design options, budget considerations, and next steps. Could you tell me more about what specific areas you're looking to renovate?"
      }

      return {
        content: mockResponse,
        sessionKey: request.sessionKey,
        model: request.model || "deepseek/deepseek-chat",
      };
    } catch (error) {
      console.error("OpenClaw mock error:", error);
      // Fallback response
      return {
        content: "I'm here to help with your renovation project. Please tell me more about what you're planning.",
        sessionKey: request.sessionKey,
        model: request.model || "deepseek/deepseek-chat",
      };
    }
  }
}

export class OpenClawContextBuilder {
  static async buildForProject(
    userId: string,
    projectId: string,
    userMessage: string,
  ): Promise<OpenClawRequest> {
    // Get or create session key
    const sessionKey = await this.getOrCreateSessionKey(userId, projectId);
    
    // Load user long-term memory
    const longTermMemories = await MemoryService.getUserLongTermMemory(userId);
    
    // Load project short-term memory
    const shortTermMemories = await MemoryService.getProjectShortTermMemory(projectId);
    
    // Load recent chat messages
    const recentMessages = await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    
    // Load project details
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Build system context
    const systemContext = this.buildSystemContext(project, longTermMemories, shortTermMemories);
    
    // Build message history
    const messages: OpenClawMessage[] = [
      { role: "system", content: systemContext },
      ...recentMessages.reverse().map(msg => ({
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];
    
    return {
      messages,
      sessionKey,
      model: "deepseek/deepseek-chat",
      temperature: 0.7,
    };
  }
  
  private static async getOrCreateSessionKey(userId: string, projectId: string): Promise<string> {
    const existing = await prisma.projectSession.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    
    if (existing) {
      // Update last active
      await prisma.projectSession.update({
        where: { id: existing.id },
        data: { lastActiveAt: new Date() },
      });
      return existing.openclawSessionKey;
    }
    
    // Create new session
    const sessionKey = `user_${userId}_project_${projectId}_${Date.now()}`;
    
    await prisma.projectSession.create({
      data: {
        userId,
        projectId,
        openclawSessionKey: sessionKey,
      },
    });
    
    return sessionKey;
  }
  
  private static buildSystemContext(
    project: any,
    longTermMemories: any[],
    shortTermMemories: any[],
  ): string {
    const lines: string[] = [];
    
    lines.push("You are a renovation advisor AI helping a homeowner with their renovation project.");
    lines.push("Your role is to provide helpful guidance, ask clarifying questions, and help them think through decisions.");
    lines.push("You are NOT a licensed designer, architect, or contractor. Do not provide engineering or compliance advice.");
    lines.push("Always be clear about what is an estimate vs a quote vs a suggestion.");
    lines.push("");
    lines.push("## PROJECT DETAILS");
    lines.push(`Title: ${project.title}`);
    lines.push(`Property type: ${project.propertyType}`);
    if (project.roomCount) lines.push(`Room count: ${project.roomCount}`);
    if (project.budget) lines.push(`Budget hint: SGD ${project.budget.toLocaleString()}`);
    if (project.stylePreference) lines.push(`Style preference: ${project.stylePreference}`);
    if (project.notes) lines.push(`Notes: ${project.notes.substring(0, 200)}...`);
    lines.push("");
    
    if (longTermMemories.length > 0) {
      lines.push("## USER LONG-TERM PREFERENCES");
      longTermMemories.forEach(mem => {
        lines.push(`- ${mem.memoryKey}: ${mem.memoryValue.substring(0, 100)}...`);
      });
      lines.push("");
    }
    
    if (shortTermMemories.length > 0) {
      lines.push("## ACTIVE PROJECT MEMORIES");
      shortTermMemories.forEach(mem => {
        lines.push(`- ${mem.memoryType}: ${mem.note.substring(0, 100)}...`);
      });
      lines.push("");
    }
    
    lines.push("## GUIDELINES");
    lines.push("1. Ask questions to clarify vague intent");
    lines.push("2. Suggest using the cost estimator tool for budget ranges");
    lines.push("3. Recommend uploading quotes for comparison");
    lines.push("4. Help organize thoughts into actionable next steps");
    lines.push("5. Be supportive but realistic about timelines and costs");
    
    return lines.join("\n");
  }
}

export class ChatService {
  static async processUserMessage(
    userId: string,
    projectId: string,
    message: string,
  ) {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        projectId,
        role: "user",
        content: message,
      },
    });
    
    // Build context and call OpenClaw
    const request = await OpenClawContextBuilder.buildForProject(userId, projectId, message);
    
    const client = new OpenClawClient();
    const response = await client.sendMessage(request);
    
    // Save assistant response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        userId,
        projectId,
        role: "assistant",
        content: response.content,
      },
    });
    
    // Classify and write memories
    await MemoryService.classifyAndWrite(
      userId,
      projectId,
      message,
      response.content,
    );
    
    return {
      userMessage,
      assistantMessage,
    };
  }
  
  static async getChatHistory(projectId: string, userId: string, limit = 50) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    const messages = await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    
    return messages;
  }
}
