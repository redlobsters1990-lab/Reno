// Contractor Matching Algorithm Service
// Phase 2: Match renovation projects with suitable contractors

import { db } from '../db';
import { logger } from '../../lib/logger';
import { openClawEnhancedService } from './openclaw-enhanced';

export interface ProjectRequirements {
  userId: string;
  projectId: string;
  projectType: string; // 'kitchen', 'bathroom', 'whole_house', etc.
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  timeline: {
    desiredStart?: Date;
    desiredCompletion?: Date;
    flexibility?: 'strict' | 'flexible' | 'open';
  };
  specialRequirements?: string[];
  priorityFactors: {
    price: number; // 1-10
    quality: number; // 1-10
    speed: number; // 1-10
    reputation: number; // 1-10
  };
}

export interface ContractorProfile {
  id: string;
  companyName: string;
  specialties: string[];
  serviceAreas: string[];
  minProjectSize: number;
  maxProjectSize: number;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  avgResponseTime?: number; // hours
  metadata?: any;
}

export interface MatchResult {
  contractorId: string;
  companyName: string;
  matchScore: number; // 0-100
  scoreBreakdown: {
    specialtyMatch: number;
    budgetMatch: number;
    locationMatch: number;
    reputationScore: number;
    capacityMatch: number;
  };
  reasoning: string[];
  recommendations: string[];
  estimatedTimeline?: {
    availability: Date;
    estimatedDuration: number; // days
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

class ContractorMatcherService {
  /**
   * Find matching contractors for a project
   */
  async findMatches(requirements: ProjectRequirements): Promise<MatchResult[]> {
    const startTime = Date.now();
    
    try {
      // Create matching job
      const job = await db.job.create({
        data: {
          userId: requirements.userId,
          projectId: requirements.projectId,
          jobType: 'contractor_matching',
          status: 'processing',
          input: JSON.stringify(requirements),
          metadata: JSON.stringify({
            requestTimestamp: new Date().toISOString()
          })
        }
      });

      // Get available contractors
      const contractors = await this.getAvailableContractors(requirements);
      
      // Calculate matches
      const matches = await this.calculateMatches(contractors, requirements);
      
      // Sort by match score
      const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);
      
      // Take top 5 matches
      const topMatches = sortedMatches.slice(0, 5);

      // Save match results
      for (const match of topMatches) {
        await db.contractorMatchResult.create({
          data: {
            userId: requirements.userId,
            projectId: requirements.projectId,
            contractorId: match.contractorId,
            matchScore: match.matchScore,
            reasoning: JSON.stringify(match.reasoning),
            metadata: JSON.stringify({
              scoreBreakdown: match.scoreBreakdown,
              recommendations: match.recommendations,
              estimatedTimeline: match.estimatedTimeline
            })
          }
        });
      }

      // Update job
      await db.job.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          output: JSON.stringify({
            totalContractors: contractors.length,
            matchesFound: topMatches.length,
            topMatchScore: topMatches[0]?.matchScore || 0
          }),
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            processingTime: Date.now() - startTime,
            matchesFound: topMatches.length
          })
        }
      });

      // Log activity
      await db.userActivity.create({
        data: {
          userId: requirements.userId,
          activityType: 'contractor_matching',
          entityType: 'Job',
          entityId: job.id,
          description: `Found ${topMatches.length} contractor matches for project ${requirements.projectId}`,
          metadata: JSON.stringify({
            projectId: requirements.projectId,
            matchesFound: topMatches.length,
            topScore: topMatches[0]?.matchScore || 0
          })
        }
      });

      // Create usage record
      await db.costEvent.create({
        data: {
          userId: requirements.userId,
          projectId: requirements.projectId,
          jobId: job.id,
          eventType: 'contractor_matching',
          units: this.calculateMatchingUnits(contractors.length, requirements),
          metadata: JSON.stringify({
            contractorsEvaluated: contractors.length,
            matchesReturned: topMatches.length,
            processingTime: Date.now() - startTime
          })
        }
      });

      return topMatches;

    } catch (error) {
      logger.error('Contractor matching failed', { error, requirements });
      throw error;
    }
  }

  /**
   * Get available contractors based on requirements
   */
  private async getAvailableContractors(requirements: ProjectRequirements): Promise<ContractorProfile[]> {
    // In production: Query from database with filters
    // For now, return mock data
    
    const mockContractors: ContractorProfile[] = [
      {
        id: 'cont-001',
        companyName: 'Renovation Experts Pte Ltd',
        specialties: ['kitchen', 'bathroom', 'living_room'],
        serviceAreas: ['Central', 'East', 'North-East'],
        minProjectSize: 10000,
        maxProjectSize: 100000,
        rating: 4.8,
        reviewCount: 124,
        completedProjects: 85,
        avgResponseTime: 24,
        metadata: {
          yearsExperience: 12,
          certifications: ['BCA', 'HDB Registered'],
          languages: ['English', 'Mandarin', 'Malay']
        }
      },
      {
        id: 'cont-002',
        companyName: 'Kitchen Specialists SG',
        specialties: ['kitchen'],
        serviceAreas: ['All Singapore'],
        minProjectSize: 15000,
        maxProjectSize: 80000,
        rating: 4.6,
        reviewCount: 89,
        completedProjects: 62,
        avgResponseTime: 48,
        metadata: {
          yearsExperience: 8,
          certifications: ['HDB Registered'],
          languages: ['English', 'Mandarin']
        }
      },
      {
        id: 'cont-003',
        companyName: 'Luxe Renovations',
        specialties: ['kitchen', 'bathroom', 'whole_house', 'luxury'],
        serviceAreas: ['Central', 'East'],
        minProjectSize: 50000,
        maxProjectSize: 500000,
        rating: 4.9,
        reviewCount: 45,
        completedProjects: 32,
        avgResponseTime: 72,
        metadata: {
          yearsExperience: 15,
          certifications: ['BCA', 'ISO Certified'],
          languages: ['English', 'Mandarin', 'Japanese']
        }
      },
      {
        id: 'cont-004',
        companyName: 'Budget Renovators',
        specialties: ['kitchen', 'bathroom', 'basic'],
        serviceAreas: ['All Singapore'],
        minProjectSize: 5000,
        maxProjectSize: 40000,
        rating: 4.2,
        reviewCount: 156,
        completedProjects: 120,
        avgResponseTime: 12,
        metadata: {
          yearsExperience: 6,
          certifications: ['HDB Registered'],
          languages: ['English', 'Mandarin', 'Tamil']
        }
      },
      {
        id: 'cont-005',
        companyName: 'Eco-Friendly Renovations',
        specialties: ['kitchen', 'bathroom', 'sustainable'],
        serviceAreas: ['Central', 'West'],
        minProjectSize: 20000,
        maxProjectSize: 150000,
        rating: 4.7,
        reviewCount: 67,
        completedProjects: 48,
        avgResponseTime: 36,
        metadata: {
          yearsExperience: 10,
          certifications: ['BCA Green Mark', 'ISO 14001'],
          languages: ['English', 'Mandarin']
        }
      }
    ];

    // Filter by service area
    const areaFiltered = mockContractors.filter(contractor =>
      contractor.serviceAreas.some(area => 
        area === 'All Singapore' || 
        requirements.location.toLowerCase().includes(area.toLowerCase()) ||
        area.toLowerCase().includes(requirements.location.toLowerCase())
      )
    );

    // Filter by project size
    const budgetMidpoint = (requirements.budgetRange.min + requirements.budgetRange.max) / 2;
    const sizeFiltered = areaFiltered.filter(contractor =>
      budgetMidpoint >= contractor.minProjectSize && 
      budgetMidpoint <= contractor.maxProjectSize
    );

    return sizeFiltered;
  }

  /**
   * Calculate match scores for contractors
   */
  private async calculateMatches(
    contractors: ContractorProfile[], 
    requirements: ProjectRequirements
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    for (const contractor of contractors) {
      const scoreBreakdown = this.calculateScoreBreakdown(contractor, requirements);
      const matchScore = this.calculateOverallScore(scoreBreakdown, requirements.priorityFactors);
      
      const reasoning = this.generateReasoning(contractor, requirements, scoreBreakdown);
      const recommendations = this.generateRecommendations(contractor, requirements, matchScore);

      matches.push({
        contractorId: contractor.id,
        companyName: contractor.companyName,
        matchScore,
        scoreBreakdown,
        reasoning,
        recommendations,
        estimatedTimeline: this.estimateTimeline(contractor, requirements),
        contactInfo: {
          email: `${contractor.companyName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '+65 9123 4567', // Mock
          website: `https://${contractor.companyName.toLowerCase().replace(/\s+/g, '')}.com.sg`
        }
      });
    }

    return matches;
  }

  /**
   * Calculate score breakdown
   */
  private calculateScoreBreakdown(
    contractor: ContractorProfile, 
    requirements: ProjectRequirements
  ): MatchResult['scoreBreakdown'] {
    // Specialty match (0-25 points)
    const specialtyMatch = this.calculateSpecialtyMatch(contractor.specialties, requirements.projectType);
    
    // Budget match (0-25 points)
    const budgetMidpoint = (requirements.budgetRange.min + requirements.budgetRange.max) / 2;
    const budgetMatch = this.calculateBudgetMatch(
      budgetMidpoint, 
      contractor.minProjectSize, 
      contractor.maxProjectSize
    );
    
    // Location match (0-20 points)
    const locationMatch = this.calculateLocationMatch(contractor.serviceAreas, requirements.location);
    
    // Reputation score (0-20 points)
    const reputationScore = this.calculateReputationScore(contractor.rating, contractor.reviewCount);
    
    // Capacity match (0-10 points)
    const capacityMatch = this.calculateCapacityMatch(contractor.completedProjects, contractor.avgResponseTime);

    return {
      specialtyMatch,
      budgetMatch,
      locationMatch,
      reputationScore,
      capacityMatch
    };
  }

  /**
   * Calculate overall match score
   */
  private calculateOverallScore(
    breakdown: MatchResult['scoreBreakdown'],
    priorityFactors: ProjectRequirements['priorityFactors']
  ): number {
    // Weight scores based on user priorities
    const weights = {
      specialtyMatch: priorityFactors.quality / 10,
      budgetMatch: priorityFactors.price / 10,
      locationMatch: 0.8, // Fixed weight for location
      reputationScore: priorityFactors.reputation / 10,
      capacityMatch: priorityFactors.speed / 10
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    
    const weightedScore = (
      breakdown.specialtyMatch * weights.specialtyMatch +
      breakdown.budgetMatch * weights.budgetMatch +
      breakdown.locationMatch * weights.locationMatch +
      breakdown.reputationScore * weights.reputationScore +
      breakdown.capacityMatch * weights.capacityMatch
    ) / totalWeight;

    return Math.min(Math.round(weightedScore * 100), 100);
  }

  /**
   * Individual scoring functions
   */
  private calculateSpecialtyMatch(specialties: string[], projectType: string): number {
    const normalizedProjectType = projectType.toLowerCase();
    const normalizedSpecialties = specialties.map(s => s.toLowerCase());
    
    if (normalizedSpecialties.includes(normalizedProjectType)) {
      return 25; // Exact match
    }
    
    // Check for related specialties
    const relatedMatches: Record<string, string[]> = {
      'kitchen': ['kitchen', 'whole_house', 'interior'],
      'bathroom': ['bathroom', 'whole_house', 'interior'],
      'whole_house': ['whole_house', 'interior', 'renovation'],
      'living_room': ['living_room', 'whole_house', 'interior']
    };
    
    const related = relatedMatches[normalizedProjectType] || [];
    if (related.some(r => normalizedSpecialties.includes(r))) {
      return 20; // Related match
    }
    
    return 10; // General contractor
  }

  private calculateBudgetMatch(
    projectBudget: number, 
    minBudget: number, 
    maxBudget: number
  ): number {
    if (projectBudget >= minBudget && projectBudget <= maxBudget) {
      // Perfect match within range
      const rangeWidth = maxBudget - minBudget;
      const position = (projectBudget - minBudget) / rangeWidth;
      
      // Best score in middle of range, lower at extremes
      const distanceFromMiddle = Math.abs(position - 0.5);
      return 25 * (1 - distanceFromMiddle * 0.5);
    }
    
    // Outside range - calculate penalty
    if (projectBudget < minBudget) {
      const ratio = projectBudget / minBudget;
      return Math.max(0, 25 * ratio * 0.5); // 50% penalty
    }
    
    if (projectBudget > maxBudget) {
      const ratio = maxBudget / projectBudget;
      return Math.max(0, 25 * ratio * 0.7); // 30% penalty
    }
    
    return 0;
  }

  private calculateLocationMatch(serviceAreas: string[], projectLocation: string): number {
    const normalizedLocation = projectLocation.toLowerCase();
    
    if (serviceAreas.includes('All Singapore')) {
      return 20; // Perfect match for nationwide
    }
    
    // Check if location contains or is contained by service area
    for (const area of serviceAreas) {
      const normalizedArea = area.toLowerCase();
      if (normalizedLocation.includes(normalizedArea) || normalizedArea.includes(normalizedLocation)) {
        return 20; // Good match
      }
    }
    
    // Check for region matches
    const regions: Record<string, string[]> = {
      'central': ['orchard', 'downtown', 'city', 'cbd'],
      'east': ['tampines', 'pasir ris', 'bedok', 'changi'],
      'west': ['jurong', 'clementi', 'bukit batok', 'boon lay'],
      'north': ['woodlands', 'sembawang', 'yishun', 'admiralty'],
      'north-east': ['hougang', 'sengkang', 'punggol', 'serangoon']
    };
    
    for (const [region, locations] of Object.entries(regions)) {
      if (serviceAreas.map(s => s.toLowerCase()).includes(region)) {
        if (locations.some(loc => normalizedLocation.includes(loc))) {
          return 18; // Regional match
        }
      }
    }
    
    return 10; // Basic match
  }

  private calculateReputationScore(rating: number, reviewCount: number): number {
    // Base score from rating (0-15 points)
    const ratingScore = (rating / 5) * 15;
    
    // Review count bonus (0-5 points)
    const reviewBonus = Math.min(5, Math.log10(reviewCount + 1) * 2);
    
    return ratingScore + reviewBonus;
  }

  private calculateCapacityMatch(completedProjects: number, avgResponseTime?: number): number {
    // Experience score (0-6 points)
    const experienceScore = Math.min(6, completedProjects / 10);
    
    // Response time score (0-4 points)
    let responseScore = 4;
    if (avgResponseTime) {
      if (avgResponseTime <= 24) responseScore = 4;
      else if (avgResponseTime <= 48) responseScore = 3;
      else if (avgResponseTime <= 72) responseScore = 2;
      else responseScore = 1;
    }
    
    return experienceScore + responseScore;
  }

  /**
   * Generate reasoning for match
   */
  private generateReasoning(
    contractor: ContractorProfile,
    requirements: ProjectRequirements,
    breakdown: MatchResult['scoreBreakdown']
  ): string[] {
    const reasoning: string[] = [];
    
    if (breakdown.specialtyMatch >= 20) {
      reasoning.push(`Specializes in ${requirements.projectType} renovations`);
    }
    
    if (breakdown.budgetMatch >= 20) {
      reasoning.push(`Budget range aligns with your project`);
    }
    
    if (breakdown.locationMatch >= 18) {
      reasoning.push(`Services your location (${requirements.location})`);
    }
    
    if (breakdown.reputationScore >= 15) {
      reasoning.push(`High rating (${contractor.rating}/5 from ${contractor.reviewCount} reviews)`);
    }
    
    if (breakdown.capacityMatch >= 8) {
      reasoning.push(`Experienced (${contractor.completedProjects}+ projects completed)`);
    }
    
    return reasoning;
  }

  /**
   * Generate recommendations
  private generateRecommendations(
    contractor: ContractorProfile,
    requirements: ProjectRequirements,
    matchScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (matchScore >= 80) {
      recommendations.push('Strong match - recommended for detailed quote');
    } else if (matchScore >= 60) {
      recommendations.push('Good match - consider for initial consultation');
    } else {
      recommendations.push('Moderate match - review carefully before proceeding');
    }
    
    // Budget-specific recommendations
    const budgetMidpoint = (requirements.budgetRange.min + requirements.budgetRange.max) / 2;
    if (budgetMidpoint < contractor.minProjectSize * 1.1) {
      recommendations.push('Project budget is at lower end of contractor\'s typical range - consider negotiating scope');
    }
    
    if (budgetMidpoint > contractor.maxProjectSize * 0.9) {
      recommendations.push('Project budget is at upper end of contractor\'s typical range - ensure scope is comprehensive');
    }
    
    // Timeline recommendations
    if (requirements.timeline.flexibility === 'strict' && contractor.avgResponseTime && contractor.avgResponseTime > 48) {
      recommendations.push('Contractor has slower response time - consider if timeline is flexible');
    }
    
    return recommendations;
  }

  /**
   * Estimate timeline
   */
  private estimateTimeline(
    contractor: ContractorProfile,
    requirements: ProjectRequirements
  ): MatchResult['estimatedTimeline'] {
    // Simple estimation based on project type and contractor capacity
    const baseDurations: Record<string, number> = {
      'kitchen': 21,
      'bathroom': 14,
      'living_room': 10,
      'whole_house': 60
    };
    
    const baseDuration = baseDurations[requirements.projectType] || 30;
    
    // Adjust based on contractor experience
    const experienceFactor = contractor.completedProjects > 50 ? 0.9 : 1.0;
    const adjustedDuration = Math.round(baseDuration * experienceFactor);
    
    // Estimate availability (mock)
    const availability = new Date();
    availability.setDate(availability.getDate() + (contractor.avgResponseTime || 7));
    
    return {
      availability,
      estimatedDuration: adjustedDuration
    };
  }

  /**
   * Calculate matching units for usage tracking
   */
  private calculateMatchingUnits(
    contractorCount: number,
    requirements: ProjectRequirements
  ): number {
    // Base units + complexity factor
    const baseUnits = 3;
    const contractorFactor = Math.min(contractorCount / 5, 3); // Cap at 3x
    const complexityFactor = Object.values(requirements.priorityFactors).reduce((a, b) => a + b, 0) / 40; // 0-1
    
    return baseUnits * (1 + contractorFactor * 0.3) * (1 + complexityFactor * 0.2);
  }

  /**
   * Get match history for a project
   */
  async getProjectMatches(projectId: string): Promise<any> {
    const matches = await db.contractorMatchResult.findMany({
      where: { projectId },
      include: {
        contractor: true
      },
      orderBy: { matchScore: 'desc' }
    });

    return {
      projectId,
      totalMatches: matches.length,
      matches: matches.map(match => ({
        id: match.id,
        contractorName: match.contractor?.companyName || 'Unknown',
        matchScore: match.matchScore,
        createdAt: match.createdAt,
        metadata: match.metadata ? JSON.parse(match.metadata) : {}
      }))
    };
  }

  /**
   * Get contractor recommendations with AI enhancement
   */
  async getAIEnhancedRecommendations(
    requirements: ProjectRequirements,
    existingMatches?: MatchResult[]
  ): Promise<{
    matches: MatchResult[];
    aiInsights: string[];
    suggestedQuestions: string[];
  }> {
    try {
      // Get initial matches
      const matches = existingMatches || await this.findMatches(requirements);
      
      // Use AI to generate insights
      const aiResponse = await openClawEnhancedService.sendRequest({
        userId: requirements.userId,
        projectId: requirements.projectId,
        agentId: 'matcher',
        message: `Analyze these contractor matches for a ${requirements.projectType} renovation project with budget SGD ${requirements.budgetRange.min.toLocaleString()} - ${requirements.budgetRange.max.toLocaleString()} in ${requirements.location}. Provide insights and suggested questions.`,
        context: {
          matches: matches.slice(0, 3).map(m => ({
            company: m.companyName,
            score: m.matchScore,
            strengths: m.reasoning.slice(0, 2)
          })),
          requirements
        }
      });

      // Parse AI response for insights
      const aiInsights = aiResponse.success ? [
        'AI Analysis:',
        ...aiResponse.content.split('\n').filter(line => line.trim())
      ] : ['AI analysis unavailable - using standard recommendations'];

      // Generate suggested questions
      const suggestedQuestions = [
        'What is your experience with similar projects in my area?',
        'Can you provide references from past clients?',
        'What is included in your quoted price?',
        'What is your project timeline and payment schedule?',
        'How do you handle unexpected issues or changes?',
        'What warranties do you provide on materials and workmanship?'
      ];

      return {
        matches,
        aiInsights,
        suggestedQuestions
      };

    } catch (error) {
      logger.warn('AI-enhanced recommendations failed', { error });
      
      // Fallback to basic matches
      const matches = existingMatches || await this.findMatches(requirements);
      
      return {
        matches,
        aiInsights: ['Using standard matching algorithm'],
        suggestedQuestions: [
          'Ask about project timeline',
          'Request detailed scope of work',
          'Inquire about payment terms'
        ]
      };
    }
  }
}

export const contractorMatcherService = new ContractorMatcherService();