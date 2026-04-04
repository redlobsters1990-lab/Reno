// Enhanced OpenClaw Gateway Integration Service
// Phase 2: Real AI integration with usage tracking

import { db } from '../db';
import { logger } from '../../lib/logger';

export interface OpenClawRequest {
  userId: string;
  projectId?: string;
  conversationId?: string;
  agentId: 'advisor' | 'estimator' | 'quote-analyzer' | 'matcher';
  message: string;
  context?: {
    projectDetails?: any;
    memoryContext?: any;
    previousMessages?: any[];
  };
}

export interface OpenClawResponse {
  success: boolean;
  content: string;
  metadata?: {
    costUnits?: number;
    processingTime?: number;
    confidence?: number;
    sources?: string[];
  };
  error?: string;
}

export interface UsageRecord {
  userId: string;
  projectId?: string;
  conversationId?: string;
  jobId?: string;
  agentId: string;
  units: number; // Message count, processing seconds, etc.
  cost?: number; // Monetary cost if applicable
  metadata?: any;
}

class OpenClawEnhancedService {
  private baseUrl: string;
  private apiKey: string;
  private isMock: boolean;

  constructor() {
    this.baseUrl = process.env.OPENCLAW_BASE_URL || 'http://localhost:18789';
    this.apiKey = process.env.OPENCLAW_API_KEY || '';
    this.isMock = !this.baseUrl || !this.apiKey;
    
    if (this.isMock) {
      logger.warn('OpenClaw service running in mock mode. Set OPENCLAW_BASE_URL and OPENCLAW_API_KEY for real integration.');
    }
  }

  /**
   * Send request to OpenClaw gateway with usage tracking
   */
  async sendRequest(request: OpenClawRequest): Promise<OpenClawResponse> {
    const startTime = Date.now();
    let jobId: string | undefined;
    
    try {
      // Create job record for tracking
      const job = await db.job.create({
        data: {
          userId: request.userId,
          projectId: request.projectId,
          conversationId: request.conversationId,
          jobType: this.mapAgentToJobType(request.agentId),
          status: 'processing',
          input: JSON.stringify({
            message: request.message,
            context: request.context
          }),
          metadata: JSON.stringify({
            agentId: request.agentId,
            requestTimestamp: new Date().toISOString()
          })
        }
      });
      
      jobId = job.id;

      // Send to OpenClaw gateway
      let response: OpenClawResponse;
      
      if (this.isMock) {
        response = await this.mockOpenClawRequest(request);
      } else {
        response = await this.realOpenClawRequest(request);
      }

      const processingTime = Date.now() - startTime;

      // Update job record
      await db.job.update({
        where: { id: jobId },
        data: {
          status: response.success ? 'completed' : 'failed',
          output: response.content,
          error: response.error,
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            processingTime,
            success: response.success,
            confidence: response.metadata?.confidence
          })
        }
      });

      // Create usage record
      await this.createUsageRecord({
        userId: request.userId,
        projectId: request.projectId,
        conversationId: request.conversationId,
        jobId,
        agentId: request.agentId,
        units: this.calculateUnits(request.agentId, request.message, processingTime),
        cost: this.calculateCost(request.agentId, processingTime),
        metadata: {
          messageLength: request.message.length,
          processingTime,
          responseLength: response.content.length,
          confidence: response.metadata?.confidence
        }
      });

      // Log activity
      await this.logUserActivity({
        userId: request.userId,
        activityType: 'ai_request',
        entityType: 'Job',
        entityId: jobId,
        description: `AI request to ${request.agentId} agent`,
        metadata: {
          agentId: request.agentId,
          projectId: request.projectId,
          success: response.success,
          processingTime
        }
      });

      return response;

    } catch (error) {
      logger.error('OpenClaw request failed', { error, request });

      // Update job if it was created
      if (jobId) {
        await db.job.update({
          where: { id: jobId },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date()
          }
        }).catch(e => logger.error('Failed to update job', { error: e }));
      }

      // Log failed activity
      await this.logUserActivity({
        userId: request.userId,
        activityType: 'ai_request_failed',
        entityType: 'Job',
        entityId: jobId,
        description: `Failed AI request to ${request.agentId} agent`,
        metadata: {
          agentId: request.agentId,
          projectId: request.projectId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }).catch(e => logger.error('Failed to log activity', { error: e }));

      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mock implementation for development/testing
   */
  private async mockOpenClawRequest(request: OpenClawRequest): Promise<OpenClawResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Context-aware mock responses
    let responseContent = '';
    const message = request.message.toLowerCase();

    switch (request.agentId) {
      case 'advisor':
        if (message.includes('kitchen')) {
          responseContent = `Based on your kitchen renovation inquiry, I recommend considering layout optimization first. For a typical kitchen renovation in Singapore, you might want to focus on: 1) Efficient work triangle design, 2) Quality cabinet materials (plywood or solid wood), 3) Durable countertops (quartz or granite), 4) Proper ventilation system. Would you like me to elaborate on any of these aspects or discuss your specific requirements?`;
        } else if (message.includes('bathroom')) {
          responseContent = `For bathroom renovations, key considerations include: waterproofing, ventilation, lighting, and fixture selection. Common upgrades are: walk-in showers, heated flooring, smart toilets, and proper drainage systems. What's your primary goal for the bathroom renovation?`;
        } else {
          responseContent = `I'd be happy to help with your renovation project! To provide the best advice, could you tell me more about: 1) Which room(s) you're renovating, 2) Your budget range, 3) Your timeline, and 4) Any specific style preferences?`;
        }
        break;

      case 'estimator':
        if (message.includes('kitchen') || message.includes('budget')) {
          responseContent = `Based on typical Singapore market rates:\n\nLEAN ESTIMATE: SGD 15,000 - 25,000\n- Basic cabinets (laminate)\n- Standard countertops\n- Mid-range appliances\n- Basic plumbing/electrical\n\nREALISTIC ESTIMATE: SGD 25,000 - 40,000\n- Custom cabinets (plywood)\n- Quartz countertops\n- Quality appliances\n- Professional installation\n\nSTRETCH ESTIMATE: SGD 40,000 - 70,000+\n- Premium materials\n- High-end appliances\n- Custom features\n- Smart home integration\n\nConfidence: High (based on 50+ similar projects)`;
        } else if (message.includes('bathroom')) {
          responseContent = `Bathroom renovation estimates:\n\nLEAN: SGD 8,000 - 15,000\n- Basic fixtures\n- Standard tiles\n- Essential waterproofing\n\nREALISTIC: SGD 15,000 - 25,000\n- Quality fixtures\n- Premium tiles\n- Comprehensive waterproofing\n- Good ventilation\n\nSTRETCH: SGD 25,000 - 40,000+\n- Luxury fixtures\n- Designer tiles\n- Heated flooring\n- Smart features`;
        } else {
          responseContent = `I can provide cost estimates for various renovation types. Please specify: 1) Room type (kitchen, bathroom, living room, etc.), 2) Size (in square feet/meters), 3) Quality level (basic, mid-range, premium), 4) Any special requirements.`;
        }
        break;

      case 'quote-analyzer':
        responseContent = `I can analyze contractor quotes to help you compare: 1) Price breakdowns, 2) Scope inclusions/exclusions, 3) Material quality, 4) Timeline estimates, 5) Warranty terms. Please upload a quote document or provide the details.`;
        break;

      case 'matcher':
        responseContent = `I can help match your project with suitable contractors based on: 1) Project type and scope, 2) Budget range, 3) Location, 4) Timeline, 5) Special requirements. Let me know your project details to begin the matching process.`;
        break;
    }

    return {
      success: true,
      content: responseContent,
      metadata: {
        costUnits: 1,
        processingTime: 800,
        confidence: 0.85,
        sources: ['mock_data', 'typical_rates_sg']
      }
    };
  }

  /**
   * Real OpenClaw gateway request
   */
  private async realOpenClawRequest(request: OpenClawRequest): Promise<OpenClawResponse> {
    const payload = {
      agentId: request.agentId,
      message: request.message,
      context: request.context,
      userId: request.userId,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: data.success || true,
      content: data.content || data.response || '',
      metadata: data.metadata || {}
    };
  }

  /**
   * Create usage/cost record
   */
  private async createUsageRecord(record: UsageRecord): Promise<void> {
    try {
      await db.costEvent.create({
        data: {
          userId: record.userId,
          projectId: record.projectId,
          jobId: record.jobId,
          eventType: this.mapAgentToEventType(record.agentId),
          units: record.units,
          cost: record.cost,
          currency: 'SGD',
          metadata: JSON.stringify(record.metadata || {})
        }
      });
    } catch (error) {
      logger.error('Failed to create usage record', { error, record });
    }
  }

  /**
   * Log user activity
   */
  private async logUserActivity(data: {
    userId: string;
    activityType: string;
    entityType?: string;
    entityId?: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await db.userActivity.create({
        data: {
          userId: data.userId,
          activityType: data.activityType,
          entityType: data.entityType,
          entityId: data.entityId,
          description: data.description,
          metadata: JSON.stringify(data.metadata || {})
        }
      });
    } catch (error) {
      logger.error('Failed to log user activity', { error, data });
    }
  }

  /**
   * Helper methods
   */
  private mapAgentToJobType(agentId: string): string {
    const mapping: Record<string, string> = {
      'advisor': 'chat_generation',
      'estimator': 'cost_estimation',
      'quote-analyzer': 'quote_analysis',
      'matcher': 'contractor_matching'
    };
    return mapping[agentId] || 'unknown';
  }

  private mapAgentToEventType(agentId: string): string {
    const mapping: Record<string, string> = {
      'advisor': 'chat_message',
      'estimator': 'cost_estimation',
      'quote-analyzer': 'quote_analysis',
      'matcher': 'contractor_matching'
    };
    return mapping[agentId] || 'unknown';
  }

  private calculateUnits(agentId: string, message: string, processingTime: number): number {
    // Simple unit calculation based on agent type and message complexity
    const baseUnits: Record<string, number> = {
      'advisor': 1,
      'estimator': 2,
      'quote-analyzer': 3,
      'matcher': 2
    };
    
    const messageComplexity = Math.min(message.length / 100, 5); // Cap at 5x
    const timeFactor = processingTime / 1000; // Convert ms to seconds
    
    return (baseUnits[agentId] || 1) * (1 + messageComplexity * 0.2) * (1 + timeFactor * 0.1);
  }

  private calculateCost(agentId: string, processingTime: number): number | undefined {
    // Mock cost calculation - in production, this would use actual pricing
    const ratePerSecond: Record<string, number> = {
      'advisor': 0.001, // SGD per second
      'estimator': 0.002,
      'quote-analyzer': 0.003,
      'matcher': 0.002
    };
    
    const rate = ratePerSecond[agentId];
    if (!rate) return undefined;
    
    return rate * (processingTime / 1000);
  }

  /**
   * Get user's AI usage summary
   */
  async getUserUsageSummary(userId: string, periodDays: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const usage = await db.costEvent.groupBy({
      by: ['eventType'],
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        units: true,
        cost: true
      },
      _count: {
        id: true
      }
    });

    const totalCost = usage.reduce((sum, item) => sum + (item._sum.cost || 0), 0);
    const totalUnits = usage.reduce((sum, item) => sum + (item._sum.units || 0), 0);

    return {
      userId,
      periodDays,
      startDate,
      totalCost,
      totalUnits,
      breakdown: usage.map(item => ({
        eventType: item.eventType,
        count: item._count.id,
        units: item._sum.units,
        cost: item._sum.cost
      })),
      lastUpdated: new Date()
    };
  }
}

export const openClawEnhancedService = new OpenClawEnhancedService();