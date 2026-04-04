// Comprehensive Audit Logger
// Tracks all significant user and system actions

import { prisma } from '../db';
import { ActivityType } from '@prisma/client';

export class AuditLogger {
  /**
   * Log authentication events
   */
  static async logAuthEvent(
    userId: string,
    eventType: 'login' | 'logout' | 'login_failed' | 'signup' | 'password_reset',
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
      attemptCount?: number;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          description: `Authentication: ${eventType}`,
          metadata: JSON.stringify(metadata),
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  /**
   * Log project-related events
   */
  static async logProjectEvent(
    userId: string,
    eventType: 'project_create' | 'project_update' | 'project_delete',
    projectId: string,
    metadata: {
      changes?: Record<string, any>;
      previousState?: Record<string, any>;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'Project',
          entityId: projectId,
          description: `Project: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log project event:', error);
    }
  }

  /**
   * Log AI service events
   */
  static async logAIEvent(
    userId: string,
    eventType: 'job_started' | 'job_completed' | 'job_failed',
    jobId: string,
    metadata: {
      jobType?: string;
      input?: string;
      output?: string;
      error?: string;
      durationMs?: number;
      cost?: number;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'Job',
          entityId: jobId,
          description: `AI Job: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log AI event:', error);
    }
  }

  /**
   * Log file upload events
   */
  static async logFileEvent(
    userId: string,
    eventType: 'file_upload' | 'file_delete',
    fileId: string,
    metadata: {
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      projectId?: string;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'UploadedFile',
          entityId: fileId,
          description: `File: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log file event:', error);
    }
  }

  /**
   * Log quote-related events
   */
  static async logQuoteEvent(
    userId: string,
    eventType: 'quote_upload' | 'quote_parsed' | 'quote_analysis',
    quoteId: string,
    metadata: {
      contractorName?: string;
      totalAmount?: number;
      projectId?: string;
      parsingResult?: Record<string, any>;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'ContractorQuote',
          entityId: quoteId,
          description: `Quote: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log quote event:', error);
    }
  }

  /**
   * Log cost estimation events
   */
  static async logCostEvent(
    userId: string,
    eventType: 'cost_estimation',
    estimateId: string,
    metadata: {
      lowEstimate?: number;
      highEstimate?: number;
      confidence?: string;
      projectId?: string;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'CostEstimate',
          entityId: estimateId,
          description: `Cost Estimation: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log cost event:', error);
    }
  }

  /**
   * Log contractor matching events
   */
  static async logContractorEvent(
    userId: string,
    eventType: 'contractor_matching',
    matchId: string,
    metadata: {
      projectId?: string;
      contractorCount?: number;
      topScore?: number;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'ContractorMatchResult',
          entityId: matchId,
          description: `Contractor Matching: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log contractor event:', error);
    }
  }

  /**
   * Log timeline prediction events
   */
  static async logTimelineEvent(
    userId: string,
    eventType: 'timeline_estimation',
    predictionId: string,
    metadata: {
      projectId?: string;
      estimatedDuration?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'TimelinePrediction',
          entityId: predictionId,
          description: `Timeline Prediction: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log timeline event:', error);
    }
  }

  /**
   * Log chat events
   */
  static async logChatEvent(
    userId: string,
    eventType: 'chat_message',
    messageId: string,
    metadata: {
      conversationId?: string;
      projectId?: string;
      role?: string;
      messageLength?: number;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: eventType as ActivityType,
          entityType: 'ChatMessage',
          entityId: messageId,
          description: `Chat: ${eventType.replace('_', ' ')}`,
          metadata: JSON.stringify(metadata)
        }
      });
    } catch (error) {
      console.error('Failed to log chat event:', error);
    }
  }

  /**
   * Log permission denial events
   */
  static async logPermissionDenied(
    userId: string,
    resourceType: string,
    resourceId: string,
    metadata: {
      attemptedAction?: string;
      reason?: string;
      ipAddress?: string;
    } = {}
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType: 'login' as ActivityType, // Using login as generic security event
          entityType: resourceType,
          entityId: resourceId,
          description: `Permission Denied: Attempted ${metadata.attemptedAction || 'access'} to ${resourceType}`,
          metadata: JSON.stringify(metadata),
          ipAddress: metadata.ipAddress
        }
      });
    } catch (error) {
      console.error('Failed to log permission denial:', error);
    }
  }

  /**
   * Get user activity history
   */
  static async getUserActivity(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      activityTypes?: ActivityType[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      limit = 100,
      offset = 0,
      activityTypes,
      startDate,
      endDate
    } = options;

    const where: any = { userId };

    if (activityTypes && activityTypes.length > 0) {
      where.activityType = { in: activityTypes };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  /**
   * Get system-wide activity (admin only)
   */
  static async getSystemActivity(
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
      activityTypes?: ActivityType[];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    const {
      limit = 100,
      offset = 0,
      userId,
      activityTypes,
      startDate,
      endDate
    } = options;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (activityTypes && activityTypes.length > 0) {
      where.activityType = { in: activityTypes };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });
  }
}