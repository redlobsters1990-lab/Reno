// Predictive Timeline Estimation Service
// Phase 2: Estimate renovation project timelines

import { db } from '../db';
import { logger } from '../../lib/logger';
import { openClawEnhancedService } from './openclaw-enhanced';

export interface TimelineInput {
  userId: string;
  projectId: string;
  projectType: string;
  scope: {
    size: number; // square feet/meters
    rooms: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    specialFeatures?: string[]; // e.g., 'custom_cabinetry', 'smart_home', 'luxury_finishes'
  };
  constraints: {
    desiredStart?: Date;
    desiredCompletion?: Date;
    budget: number;
    availability: 'flexible' | 'moderate' | 'urgent';
  };
  dependencies?: {
    permitsRequired: boolean;
    designApprovalNeeded: boolean;
    materialLeadTimes: string[]; // e.g., 'custom_cabinets: 4-6 weeks'
  };
}

export interface TimelinePrediction {
  phases: ProjectPhase[];
  summary: {
    estimatedStart: Date;
    estimatedCompletion: Date;
    totalDuration: number; // days
    confidence: number; // 0-1
    criticalPath: string[];
    riskFactors: RiskFactor[];
  };
  recommendations: string[];
  assumptions: string[];
}

export interface ProjectPhase {
  name: string;
  description: string;
  duration: number; // days
  dependencies: string[]; // phase names that must complete first
  resources: string[];
  milestones: string[];
}

export interface RiskFactor {
  type: 'schedule' | 'cost' | 'quality' | 'scope';
  description: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

class TimelinePredictorService {
  /**
   * Generate timeline prediction for a project
   */
  async predictTimeline(input: TimelineInput): Promise<TimelinePrediction> {
    const startTime = Date.now();
    
    try {
      // Create prediction job
      const job = await db.job.create({
        data: {
          userId: input.userId,
          projectId: input.projectId,
          jobType: 'timeline_prediction',
          status: 'processing',
          input: JSON.stringify(input),
          metadata: JSON.stringify({
            requestTimestamp: new Date().toISOString()
          })
        }
      });

      // Generate prediction
      const prediction = await this.generatePrediction(input);
      
      // Save prediction to database
      const savedPrediction = await db.timelinePrediction.create({
        data: {
          userId: input.userId,
          projectId: input.projectId,
          predictionType: input.projectType,
          startDate: prediction.summary.estimatedStart,
          completionDate: prediction.summary.estimatedCompletion,
          durationDays: prediction.summary.totalDuration,
          confidence: prediction.summary.confidence,
          milestones: JSON.stringify(prediction.phases.flatMap(p => p.milestones)),
          assumptions: JSON.stringify(prediction.assumptions),
          metadata: JSON.stringify({
            phases: prediction.phases,
            riskFactors: prediction.summary.riskFactors,
            recommendations: prediction.recommendations
          })
        }
      });

      // Update job
      await db.job.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          output: JSON.stringify(prediction.summary),
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            processingTime: Date.now() - startTime,
            predictionId: savedPrediction.id,
            confidence: prediction.summary.confidence
          })
        }
      });

      // Log activity
      await db.userActivity.create({
        data: {
          userId: input.userId,
          activityType: 'timeline_predicted',
          entityType: 'TimelinePrediction',
          entityId: savedPrediction.id,
          description: `Generated timeline prediction for ${input.projectType} project`,
          metadata: JSON.stringify({
            projectId: input.projectId,
            duration: prediction.summary.totalDuration,
            confidence: prediction.summary.confidence
          })
        }
      });

      // Create usage record
      await db.costEvent.create({
        data: {
          userId: input.userId,
          projectId: input.projectId,
          jobId: job.id,
          eventType: 'timeline_prediction',
          units: this.calculatePredictionUnits(input),
          metadata: JSON.stringify({
            projectComplexity: input.scope.complexity,
            phaseCount: prediction.phases.length,
            processingTime: Date.now() - startTime
          })
        }
      });

      return prediction;

    } catch (error) {
      logger.error('Timeline prediction failed', { error, input });
      throw error;
    }
  }

  /**
   * Generate prediction based on input
   */
  private async generatePrediction(input: TimelineInput): Promise<TimelinePrediction> {
    // Use AI if available, otherwise use rule-based
    if (process.env.OPENCLAW_API_KEY) {
      try {
        return await this.predictWithAI(input);
      } catch (error) {
        logger.warn('AI prediction failed, falling back to rules', { error });
      }
    }
    
    return this.predictWithRules(input);
  }

  /**
   * Predict using AI (OpenClaw)
   */
  private async predictWithAI(input: TimelineInput): Promise<TimelinePrediction> {
    const aiResponse = await openClawEnhancedService.sendRequest({
      userId: input.userId,
      projectId: input.projectId,
      agentId: 'advisor',
      message: `Predict timeline for ${input.projectType} renovation. Scope: ${input.scope.size} sqft, ${input.scope.complexity} complexity. Budget: SGD ${input.constraints.budget.toLocaleString()}.`,
      context: {
        task: 'timeline_prediction',
        inputDetails: input
      }
    });

    if (!aiResponse.success) {
      throw new Error(`AI prediction failed: ${aiResponse.error}`);
    }

    // Parse AI response (simplified - in production would parse structured data)
    // For now, use rule-based with AI-enhanced confidence
    const ruleBased = this.predictWithRules(input);
    
    // Enhance with AI insights
    return {
      ...ruleBased,
      summary: {
        ...ruleBased.summary,
        confidence: Math.min(ruleBased.summary.confidence * 1.2, 0.95) // Boost confidence
      },
      recommendations: [
        ...ruleBased.recommendations,
        'AI Analysis: ' + aiResponse.content.substring(0, 200) + '...'
      ]
    };
  }

  /**
   * Rule-based prediction
   */
  private predictWithRules(input: TimelineInput): TimelinePrediction {
    // Base timelines by project type (days)
    const baseTimelines: Record<string, number> = {
      'kitchen': 21,
      'bathroom': 14,
      'living_room': 10,
      'bedroom': 7,
      'whole_house': 60,
      'office': 15,
      'balcony': 5
    };

    // Complexity multipliers
    const complexityMultipliers = {
      'simple': 0.8,
      'moderate': 1.0,
      'complex': 1.5
    };

    // Size factor (non-linear)
    const baseSize = 100; // sqft
    const sizeFactor = 1 + (Math.log(input.scope.size / baseSize + 1) * 0.3);

    // Calculate base duration
    const baseDuration = baseTimelines[input.projectType] || 30;
    const adjustedDuration = Math.round(
      baseDuration * 
      complexityMultipliers[input.scope.complexity] * 
      sizeFactor
    );

    // Define phases based on project type
    const phases = this.generatePhases(input.projectType, adjustedDuration);

    // Calculate start date (consider dependencies)
    const startDate = this.calculateStartDate(input);
    const completionDate = this.calculateCompletionDate(startDate, adjustedDuration, input);

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(phases);

    // Assess risks
    const riskFactors = this.assessRisks(input, adjustedDuration);

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, adjustedDuration, riskFactors);

    // List assumptions
    const assumptions = this.generateAssumptions(input);

    return {
      phases,
      summary: {
        estimatedStart: startDate,
        estimatedCompletion: completionDate,
        totalDuration: adjustedDuration,
        confidence: this.calculateConfidence(input, adjustedDuration),
        criticalPath,
        riskFactors
      },
      recommendations,
      assumptions
    };
  }

  /**
   * Generate project phases
   */
  private generatePhases(projectType: string, totalDuration: number): ProjectPhase[] {
    const phaseTemplates: Record<string, ProjectPhase[]> = {
      'kitchen': [
        {
          name: 'Planning & Design',
          description: 'Finalize layout, select materials, obtain approvals',
          duration: Math.round(totalDuration * 0.15),
          dependencies: [],
          resources: ['Designer', 'Architect'],
          milestones: ['Design approved', 'Materials selected', 'Permits obtained']
        },
        {
          name: 'Demolition',
          description: 'Remove existing cabinets, countertops, flooring',
          duration: Math.round(totalDuration * 0.10),
          dependencies: ['Planning & Design'],
          resources: ['Demolition crew'],
          milestones: ['Site cleared', 'Debris removed']
        },
        {
          name: 'Rough-in Work',
          description: 'Electrical, plumbing, HVAC modifications',
          duration: Math.round(totalDuration * 0.20),
          dependencies: ['Demolition'],
          resources: ['Electrician', 'Plumber'],
          milestones: ['Wiring complete', 'Plumbing rough-in complete', 'Inspections passed']
        },
        {
          name: 'Installation',
          description: 'Install cabinets, countertops, appliances',
          duration: Math.round(totalDuration * 0.35),
          dependencies: ['Rough-in Work'],
          resources: ['Carpenter', 'Countertop installer', 'Appliance technician'],
          milestones: ['Cabinets installed', 'Countertops installed', 'Appliances installed']
        },
        {
          name: 'Finishing',
          description: 'Painting, backsplash, flooring, trim work',
          duration: Math.round(totalDuration * 0.15),
          dependencies: ['Installation'],
          resources: ['Painter', 'Tile setter', 'Flooring installer'],
          milestones: ['Painting complete', 'Backsplash installed', 'Flooring complete']
        },
        {
          name: 'Final Inspection',
          description: 'Quality check, cleaning, handover',
          duration: Math.round(totalDuration * 0.05),
          dependencies: ['Finishing'],
          resources: ['Project manager', 'Cleaner'],
          milestones: ['Final inspection passed', 'Site cleaned', 'Project handover']
        }
      ],
      'bathroom': [
        {
          name: 'Planning',
          description: 'Design finalization, material selection',
          duration: Math.round(totalDuration * 0.10),
          dependencies: [],
          resources: ['Designer'],
          milestones: ['Design approved', 'Materials selected']
        },
        {
          name: 'Demolition',
          description: 'Remove existing fixtures, tiles, flooring',
          duration: Math.round(totalDuration * 0.15),
          dependencies: ['Planning'],
          resources: ['Demolition crew'],
          milestones: ['Site cleared']
        },
        {
          name: 'Waterproofing',
          description: 'Apply waterproof membrane, critical for bathrooms',
          duration: Math.round(totalDuration * 0.10),
          dependencies: ['Demolition'],
          resources: ['Waterproofing specialist'],
          milestones: ['Waterproofing complete', 'Inspection passed']
        },
        {
          name: 'Rough Plumbing',
          description: 'Install drain lines, water supply',
          duration: Math.round(totalDuration * 0.15),
          dependencies: ['Waterproofing'],
          resources: ['Plumber'],
          milestones: ['Plumbing rough-in complete']
        },
        {
          name: 'Tile Work',
          description: 'Install wall and floor tiles',
          duration: Math.round(totalDuration * 0.25),
          dependencies: ['Rough Plumbing'],
          resources: ['Tile setter'],
          milestones: ['Wall tiles complete', 'Floor tiles complete']
        },
        {
          name: 'Fixture Installation',
          description: 'Install toilet, sink, shower, accessories',
          duration: Math.round(totalDuration * 0.15),
          dependencies: ['Tile Work'],
          resources: ['Plumber', 'Handyman'],
          milestones: ['All fixtures installed']
        },
        {
          name: 'Finishing',
          description: 'Grouting, sealing, painting, cleaning',
          duration: Math.round(totalDuration * 0.10),
          dependencies: ['Fixture Installation'],
          resources: ['Painter', 'Cleaner'],
          milestones: ['Grouting complete', 'Final cleaning', 'Handover']
        }
      ]
    };

    return phaseTemplates[projectType] || this.generateGenericPhases(totalDuration);
  }

  /**
   * Generate generic phases for unspecified project types
   */
  private generateGenericPhases(totalDuration: number): ProjectPhase[] {
    return [
      {
        name: 'Planning',
        description: 'Project planning and preparation',
        duration: Math.round(totalDuration * 0.10),
        dependencies: [],
        resources: ['Project manager'],
        milestones: ['Plan approved']
      },
      {
        name: 'Preparation',
        description: 'Site preparation and material procurement',
        duration: Math.round(totalDuration * 0.15),
        dependencies: ['Planning'],
        resources: ['Site supervisor'],
        milestones: ['Site ready', 'Materials delivered']
      },
      {
        name: 'Construction',
        description: 'Main construction work',
        duration: Math.round(totalDuration * 0.60),
        dependencies: ['Preparation'],
        resources: ['Construction crew'],
        milestones: ['Main work complete']
      },
      {
        name: 'Finishing',
        description: 'Final touches and cleanup',
        duration: Math.round(totalDuration * 0.10),
        dependencies: ['Construction'],
        resources: ['Finishing crew', 'Cleaner'],
        milestones: ['Finishing complete', 'Site cleaned']
      },
      {
        name: 'Handover',
        description: 'Final inspection and project handover',
        duration: Math.round(totalDuration * 0.05),
        dependencies: ['Finishing'],
        resources: ['Project manager', 'Client'],
        milestones: ['Inspection passed', 'Project handed over']
      }
    ];
  }

  /**
   * Calculate start date considering constraints
   */
  private calculateStartDate(input: TimelineInput): Date {
    const startDate = new Date();
    
    // If desired start is in future, use it
    if (input.constraints.desiredStart && input.constraints.desiredStart > startDate) {
      return input.constraints.desiredStart;
    }
    
    // Add buffer based on urgency
    const bufferDays = {
      'urgent': 3,
      'moderate': 7,
      'flexible': 14
    }[input.constraints.availability] || 7;
    
    startDate.setDate(startDate.getDate() + bufferDays);
    return startDate;
  }

  /**
   * Calculate completion date
   */
  private calculateCompletionDate(
    startDate: Date, 
    duration: number, 
    input: TimelineInput
  ): Date {
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + duration);
    
    // If desired completion is earlier, adjust or warn
    if (input.constraints.desiredCompletion && input.constraints.desiredCompletion < completionDate) {
      // Can't meet desired date - use calculated date
      // In production, would return warning
    }
    
    return completionDate;
  }

  /**
   * Identify critical path (longest sequence of dependent phases)
   */
  private identifyCriticalPath(phases: ProjectPhase[]): string[] {
    // Simplified critical path identification
    // In production, would use proper critical path method (CPM)
    
    const criticalPath: string[] = [];
    let currentPhase = phases.find(p => p.dependencies.length === 0);
    
    while (currentPhase) {
      criticalPath.push(currentPhase.name);
      
      // Find next phase that depends on current
      const nextPhase = phases.find(p => 
        p.dependencies.includes(currentPhase!.name) &&
        p.dependencies.every(dep => criticalPath.includes(dep))
      );
      
      if (!nextPhase) break;
      currentPhase = nextPhase;
    }
    
    return criticalPath;
  }

  /**
   * Assess project risks
   */
  private assessRisks(input: TimelineInput, duration: number): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    // Schedule risks
    if (input.constraints.availability === 'urgent') {
      risks.push({
        type: 'schedule',
        description: 'Urgent timeline increases risk of delays',
        impact: 'medium',
        mitigation: 'Consider phased approach or premium scheduling'
      });
    }
    
    if (input.scope.complexity === 'complex') {
      risks.push({
        type: 'schedule',
        description: 'Complex projects have higher uncertainty',
        impact: 'high',
        mitigation: 'Include contingency buffer in schedule'
      });
    }
    
    if (input.dependencies?.permitsRequired) {
      risks.push({
        type: 'schedule',
        description: 'Permit approval process can cause delays',
        impact: 'medium',
        mitigation: 'Start permit application early'
      });
    }
    
    // Cost risks
    if (input.scope.specialFeatures?.includes('custom_cabinetry')) {
      risks.push({
        type: 'cost',
        description: 'Custom cabinetry has longer lead times and higher cost variability',
        impact: 'medium',
        mitigation: 'Finalize designs early and get firm quotes'
      });
    }
    
    // Quality risks
    if (input.constraints.budget < this.estimateReasonableBudget(input)) {
      risks.push({
        type: 'quality',
        description: 'Budget may be tight for desired quality',
        impact: 'high',
        mitigation: 'Review scope or adjust quality expectations'
      });
    }
    
    return risks;
  }

  /**
   * Estimate reasonable budget for comparison
   */
  private estimateReasonableBudget(input: TimelineInput): number {
    const baseRates: Record<string, number> = {
      'kitchen': 300, // SGD per sqft
      'bathroom': 250,
      'living_room': 150,
      'bedroom': 100,
      'whole_house': 200
    };
    
    const baseRate = baseRates[input.projectType] || 150;
    const complexityMultiplier = {
      'simple': 0.8,
      'moderate': 1.0,
      'complex': 1.5
    }[input.scope.complexity];
    
    return input.scope.size * baseRate * complexityMultiplier;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    input: TimelineInput, 
    duration: number,
    risks: RiskFactor[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Timeline recommendations
    if (duration > 30) {
      recommendations.push('Consider breaking project into phases for better manageability');
    }
    
    if (input.constraints.availability === 'urgent') {
      recommendations.push('For urgent timeline, consider premium scheduling (may incur additional costs)');
    }
    
    // Budget recommendations
    const reasonableBudget = this.estimateReasonableBudget(input);
    if (input.constraints.budget < reasonableBudget * 0.8) {
      recommendations.push('Budget appears tight. Consider: 1) Phasing project, 2) Reducing scope, 3) Exploring financing options');
    }
    
    // Risk mitigation recommendations
    const highRisks = risks.filter(r => r.impact === 'high');
    if (highRisks.length > 0) {
      recommendations.push('High risks identified. Recommended: ' + highRisks.map(r => r.mitigation).join('; '));
    }
    
    // General recommendations
    recommendations.push('Secure contractor early to lock in schedule');
    recommendations.push('Order long-lead items (custom cabinets, special fixtures) as soon as designs are finalized');
    recommendations.push('Include 10-20% contingency in both timeline and budget');
    
    return recommendations;
  }

  /**
   * Generate assumptions
   */
  private generateAssumptions(input: TimelineInput): string[] {
    const assumptions: string[] = [
      'Contractor availability within 2 weeks of project start',
      'No major unforeseen site conditions',
      'Timely client decisions and approvals',
      'Standard working hours (Mon-Fri, 9am-6pm)',
      'No public holidays during critical phases'
    ];
    
    if (input.dependencies?.permitsRequired) {
      assumptions.push('Permit approval within standard processing time (2-4 weeks)');
    }
    
    if (input.scope.specialFeatures?.includes('custom_cabinetry')) {
      assumptions.push('Custom cabinetry lead time: 4-6 weeks from design approval');
    }
    
    if (input.constraints.availability === 'flexible') {
      assumptions.push('Flexible schedule allows for optimal contractor sequencing');
    }
    
    return assumptions;
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(input: TimelineInput, duration: number): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on input completeness
    if (input.scope.size && input.scope.complexity) confidence += 0.1;
    if (input.constraints.budget) confidence += 0.05;
    if (input.constraints.desiredStart) confidence += 0.05;
    
    // Adjust based on project type familiarity
    const commonTypes = ['kitchen', 'bathroom', 'living_room', 'whole_house'];
    if (commonTypes.includes(input.projectType)) confidence += 0.1;
    
    // Adjust based on complexity
    if (input.scope.complexity === 'simple') confidence += 0.05;
    if (input.scope.complexity === 'complex') confidence -= 0.05;
    
    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Calculate prediction units for usage tracking
   */
  private calculatePredictionUnits(input: TimelineInput): number {
    // Base units + complexity factors
    const baseUnits = 2;
    const complexityFactor = {
      'simple': 1.0,
      'moderate': 1.3,
      'complex': 1.8
    }[input.scope.complexity] || 1.0;
    
    const scopeFactor = 1 + (input.scope.size / 500); // Size in sqft
    const featureFactor = 1 + (input.scope.specialFeatures?.length || 0) * 0.1;
    
    return baseUnits * complexityFactor * scopeFactor * featureFactor;
  }

  /**
   * Get historical predictions for comparison
   */
  async getHistoricalComparisons(
    projectType: string,
    size: number,
    complexity: string
  ): Promise<any> {
    // In production: Query actual historical data
    // For now, return mock comparisons
    
    const mockComparisons = [
      {
        projectType: 'kitchen',
        size: 120,
        complexity: 'moderate',
        actualDuration: 25,
        predictedDuration: 23,
        variance: '+2 days',
        completedDate: '2026-03-15'
      },
      {
        projectType: 'bathroom',
        size: 80,
        complexity: 'simple',
        actualDuration: 12,
        predictedDuration: 14,
        variance: '-2 days',
        completedDate: '2026-02-28'
      },
      {
        projectType: 'living_room',
        size: 200,
        complexity: 'moderate',
        actualDuration: 18,
        predictedDuration: 16,
        variance: '+2 days',
        completedDate: '2026-03-22'
      }
    ];

    // Filter and return relevant comparisons
    const relevant = mockComparisons.filter(c => 
      c.projectType === projectType &&
      Math.abs(c.size - size) / size < 0.3 && // Within 30% size
      c.complexity === complexity
    );

    return {
      projectType,
      size,
      complexity,
      comparisonCount: relevant.length,
      averageActualDuration: relevant.length > 0 
        ? relevant.reduce((sum, c) => sum + c.actualDuration, 0) / relevant.length
        : null,
      comparisons: relevant
    };
  }

  /**
   * Update prediction with actual progress
   */
  async updatePredictionWithProgress(
    predictionId: string,
    actualProgress: {
      phase: string;
      actualStart?: Date;
      actualCompletion?: Date;
      delays?: number; // days
      notes?: string;
    }
  ): Promise<void> {
    const prediction = await db.timelinePrediction.findUnique({
      where: { id: predictionId }
    });

    if (!prediction) {
      throw new Error('Prediction not found');
    }

    const metadata = prediction.metadata ? JSON.parse(prediction.metadata) : {};
    const phases = metadata.phases || [];
    
    // Update phase in metadata
    const updatedPhases = phases.map((phase: any) => {
      if (phase.name === actualProgress.phase) {
        return {
          ...phase,
          actualStart: actualProgress.actualStart,
          actualCompletion: actualProgress.actualCompletion,
          delays: actualProgress.delays,
          notes: actualProgress.notes
        };
      }
      return phase;
    });

    // Recalculate if significant delay
    let updatedPrediction = { ...prediction };
    if (actualProgress.delays && actualProgress.delays > 3) {
      // In production: Re-run prediction with updated data
      // For now, just update metadata
      metadata.lastUpdated = new Date().toISOString();
      metadata.delaysRecorded = (metadata.delaysRecorded || 0) + 1;
    }

    await db.timelinePrediction.update({
      where: { id: predictionId },
      data: {
        metadata: JSON.stringify({
          ...metadata,
          phases: updatedPhases,
          lastProgressUpdate: new Date().toISOString()
        }),
        updatedAt: new Date()
      }
    });

    // Log update activity
    await db.userActivity.create({
      data: {
        userId: prediction.userId,
        activityType: 'timeline_updated',
        entityType: 'TimelinePrediction',
        entityId: predictionId,
        description: `Updated timeline prediction with progress on ${actualProgress.phase}`,
        metadata: JSON.stringify({
          phase: actualProgress.phase,
          delays: actualProgress.delays,
          predictionId
        })
      }
    });
  }
}

export const timelinePredictorService = new TimelinePredictorService();