// Advanced Quote Parsing Service with OCR Capabilities
// Phase 2: Extract structured data from contractor quotations

import { db } from '../db';
import { logger } from '../../lib/logger';
import { openClawEnhancedService } from './openclaw-enhanced';

export interface ParsedQuoteData {
  contractorName: string;
  quoteNumber?: string;
  quoteDate?: Date;
  totalAmount: number;
  currency: string;
  lineItems: QuoteLineItem[];
  summary: {
    materialCost?: number;
    laborCost?: number;
    otherCosts?: number;
    tax?: number;
    discount?: number;
  };
  terms?: {
    validityPeriod?: number; // days
    paymentTerms?: string;
    warranty?: string;
    timeline?: string;
  };
  metadata: {
    confidence: number;
    extractionMethod: 'ocr' | 'manual' | 'ai';
    warnings: string[];
    rawText?: string;
  };
}

export interface QuoteLineItem {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
  category?: string; // e.g., 'materials', 'labor', 'equipment'
  notes?: string;
}

export interface ParseQuoteRequest {
  userId: string;
  projectId: string;
  fileId?: string; // If parsing from uploaded file
  textContent?: string; // Direct text input
  fileType?: 'pdf' | 'image' | 'text';
}

class QuoteParserService {
  /**
   * Parse contractor quote from various sources
   */
  async parseQuote(request: ParseQuoteRequest): Promise<ParsedQuoteData> {
    const startTime = Date.now();
    
    try {
      // Create parsing job
      const job = await db.job.create({
        data: {
          userId: request.userId,
          projectId: request.projectId,
          jobType: 'quote_parsing',
          status: 'processing',
          input: JSON.stringify({
            fileId: request.fileId,
            fileType: request.fileType,
            hasTextContent: !!request.textContent
          }),
          metadata: JSON.stringify({
            requestTimestamp: new Date().toISOString()
          })
        }
      });

      let extractedText: string;
      let extractionMethod: 'ocr' | 'manual' | 'ai';

      // Extract text based on input type
      if (request.textContent) {
        extractedText = request.textContent;
        extractionMethod = 'manual';
      } else if (request.fileId) {
        // In production: Implement actual OCR for PDF/image files
        // For now, mock the OCR process
        extractedText = await this.mockOCRProcessing(request.fileId);
        extractionMethod = 'ocr';
      } else {
        throw new Error('Either textContent or fileId must be provided');
      }

      // Parse structured data from text
      const parsedData = await this.parseStructuredData(extractedText, request);

      // Update job with results
      await db.job.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          output: JSON.stringify(parsedData),
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(job.metadata || '{}'),
            processingTime: Date.now() - startTime,
            extractionMethod,
            confidence: parsedData.metadata.confidence
          })
        }
      });

      // Log activity
      await db.userActivity.create({
        data: {
          userId: request.userId,
          activityType: 'quote_parsed',
          entityType: 'Job',
          entityId: job.id,
          description: `Parsed contractor quote for project ${request.projectId}`,
          metadata: JSON.stringify({
            projectId: request.projectId,
            extractionMethod,
            confidence: parsedData.metadata.confidence,
            lineItemCount: parsedData.lineItems.length
          })
        }
      });

      // Create usage record
      await db.costEvent.create({
        data: {
          userId: request.userId,
          projectId: request.projectId,
          jobId: job.id,
          eventType: 'quote_parsing',
          units: this.calculateParsingUnits(extractedText.length),
          metadata: JSON.stringify({
            textLength: extractedText.length,
            lineItems: parsedData.lineItems.length,
            extractionMethod
          })
        }
      });

      return parsedData;

    } catch (error) {
      logger.error('Quote parsing failed', { error, request });
      throw error;
    }
  }

  /**
   * Mock OCR processing for development
   */
  private async mockOCRProcessing(fileId: string): Promise<string> {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Return mock extracted text
    return `QUOTATION

Contractor: Renovation Experts Pte Ltd
Quote No: RE-2026-042
Date: 2026-04-03
Valid Until: 2026-05-03

Project: Kitchen Renovation
Address: 123 Sample Street, Singapore 123456

LINE ITEMS:
1. Demolition & Disposal
   - Remove existing cabinets, countertops, flooring
   - Dispose of debris
   Quantity: 1 lot | Unit Price: $1,200.00 | Total: $1,200.00

2. Cabinetry
   - Custom kitchen cabinets (plywood)
   - Soft-close hinges and drawers
   - Installation included
   Quantity: 18 linear feet | Unit Price: $350.00/ft | Total: $6,300.00

3. Countertops
   - Quartz countertops (2cm thickness)
   - Cutouts for sink and cooktop
   - Installation and sealing
   Quantity: 25 sqft | Unit Price: $120.00/sqft | Total: $3,000.00

4. Backsplash
   - Ceramic subway tiles
   - Grout and installation
   Quantity: 40 sqft | Unit Price: $45.00/sqft | Total: $1,800.00

5. Plumbing
   - Install new sink and faucet
   - Connect dishwasher
   - Water supply lines
   Quantity: 1 set | Unit Price: $800.00 | Total: $800.00

6. Electrical
   - Install new outlets (6 nos)
   - Under-cabinet lighting
   - Range hood wiring
   Quantity: 1 lot | Unit Price: $1,500.00 | Total: $1,500.00

7. Flooring
   - Porcelain tiles installation
   - Leveling and preparation
   Quantity: 120 sqft | Unit Price: $25.00/sqft | Total: $3,000.00

SUBTOTAL: $17,600.00
GST (9%): $1,584.00
TOTAL AMOUNT: $19,184.00

TERMS & CONDITIONS:
- 30% deposit upon acceptance
- 40% upon delivery of materials
- 30% upon completion
- 12-month workmanship warranty
- Estimated timeline: 3-4 weeks

Notes: Price includes all labor and materials unless otherwise specified.`;
  }

  /**
   * Parse structured data from extracted text
   */
  private async parseStructuredData(text: string, request: ParseQuoteRequest): Promise<ParsedQuoteData> {
    // Use AI for advanced parsing if available
    if (process.env.OPENCLAW_API_KEY) {
      return await this.parseWithAI(text, request);
    } else {
      return this.parseWithRules(text);
    }
  }

  /**
   * Parse using AI (OpenClaw)
   */
  private async parseWithAI(text: string, request: ParseQuoteRequest): Promise<ParsedQuoteData> {
    try {
      const aiResponse = await openClawEnhancedService.sendRequest({
        userId: request.userId,
        projectId: request.projectId,
        agentId: 'quote-analyzer',
        message: `Parse this contractor quote and extract structured data:\n\n${text.substring(0, 4000)}`,
        context: {
          task: 'quote_parsing',
          expectedFields: ['contractorName', 'totalAmount', 'lineItems', 'terms']
        }
      });

      if (!aiResponse.success) {
        throw new Error(`AI parsing failed: ${aiResponse.error}`);
      }

      // Parse AI response (would need proper JSON parsing in production)
      // For now, return mock parsed data
      return this.parseWithRules(text);

    } catch (error) {
      logger.warn('AI parsing failed, falling back to rule-based', { error });
      return this.parseWithRules(text);
    }
  }

  /**
   * Rule-based parsing (fallback)
   */
  private parseWithRules(text: string): ParsedQuoteData {
    const lines = text.split('\n');
    const result: ParsedQuoteData = {
      contractorName: 'Unknown Contractor',
      totalAmount: 0,
      currency: 'SGD',
      lineItems: [],
      summary: {},
      metadata: {
        confidence: 0.7,
        extractionMethod: 'ocr',
        warnings: []
      }
    };

    // Simple rule-based extraction
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Extract contractor name
      if (lowerLine.includes('contractor:') || lowerLine.includes('company:')) {
        result.contractorName = line.split(':')[1]?.trim() || result.contractorName;
      }

      // Extract total amount
      if (lowerLine.includes('total') && lowerLine.includes('$')) {
        const amountMatch = line.match(/\$?([\d,]+\.?\d*)/);
        if (amountMatch) {
          result.totalAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
        }
      }

      // Extract line items (simplified)
      if (line.includes('|') && line.includes('$')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          const description = parts[0];
          const unitPriceMatch = parts[1].match(/\$?([\d,]+\.?\d*)/);
          const totalPriceMatch = parts[2].match(/\$?([\d,]+\.?\d*)/);

          if (unitPriceMatch && totalPriceMatch) {
            result.lineItems.push({
              description,
              quantity: 1, // Simplified
              unitPrice: parseFloat(unitPriceMatch[1].replace(/,/g, '')),
              totalPrice: parseFloat(totalPriceMatch[1].replace(/,/g, ''))
            });
          }
        }
      }
    }

    // Calculate summary if line items exist
    if (result.lineItems.length > 0) {
      const subtotal = result.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      result.summary = {
        materialCost: subtotal * 0.6, // Estimate
        laborCost: subtotal * 0.4, // Estimate
        otherCosts: 0
      };
    }

    return result;
  }

  /**
   * Calculate parsing units based on text complexity
   */
  private calculateParsingUnits(textLength: number): number {
    // Base units + complexity factor
    const baseUnits = 2;
    const lengthFactor = Math.min(textLength / 1000, 10); // Cap at 10x
    return baseUnits * (1 + lengthFactor * 0.1);
  }

  /**
   * Save parsed quote to database
   */
  async saveParsedQuote(userId: string, projectId: string, parsedData: ParsedQuoteData): Promise<string> {
    const quote = await db.contractorQuote.create({
      data: {
        userId,
        projectId,
        contractorName: parsedData.contractorName,
        totalAmount: parsedData.totalAmount,
        currency: parsedData.currency,
        status: 'parsed',
        parsingSummary: JSON.stringify({
          extractionMethod: parsedData.metadata.extractionMethod,
          confidence: parsedData.metadata.confidence,
          warnings: parsedData.metadata.warnings
        }),
        metadata: JSON.stringify(parsedData)
      }
    });

    // Save line items
    for (const lineItem of parsedData.lineItems) {
      await db.quoteLineItem.create({
        data: {
          userId,
          quoteId: quote.id,
          description: lineItem.description,
          quantity: lineItem.quantity,
          unit: lineItem.unit,
          unitPrice: lineItem.unitPrice,
          totalPrice: lineItem.totalPrice,
          category: lineItem.category,
          notes: lineItem.notes
        }
      });
    }

    return quote.id;
  }

  /**
   * Compare multiple quotes
   */
  async compareQuotes(quoteIds: string[]): Promise<any> {
    const quotes = await db.contractorQuote.findMany({
      where: { id: { in: quoteIds } },
      include: { lineItems: true }
    });

    const comparison = {
      summary: {
        totalQuotes: quotes.length,
        priceRange: {
          min: Math.min(...quotes.map(q => q.totalAmount || 0)),
          max: Math.max(...quotes.map(q => q.totalAmount || 0)),
          average: quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / quotes.length
        }
      },
      quotes: quotes.map(quote => ({
        id: quote.id,
        contractorName: quote.contractorName,
        totalAmount: quote.totalAmount,
        currency: quote.currency,
        lineItemCount: quote.lineItems.length,
        status: quote.status,
        createdAt: quote.createdAt
      })),
      recommendations: this.generateRecommendations(quotes)
    };

    return comparison;
  }

  /**
   * Generate recommendations based on quote comparison
   */
  private generateRecommendations(quotes: any[]): string[] {
    const recommendations: string[] = [];

    if (quotes.length < 2) {
      recommendations.push('Upload more quotes for better comparison');
      return recommendations;
    }

    const prices = quotes.map(q => q.totalAmount || 0).filter(p => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Price analysis
    const lowestQuote = quotes.reduce((min, q) => 
      (q.totalAmount || Infinity) < (min.totalAmount || Infinity) ? q : min
    );
    const highestQuote = quotes.reduce((max, q) => 
      (q.totalAmount || 0) > (max.totalAmount || 0) ? q : max
    );

    if (lowestQuote.totalAmount && highestQuote.totalAmount) {
      const priceDifference = ((highestQuote.totalAmount - lowestQuote.totalAmount) / lowestQuote.totalAmount) * 100;
      
      if (priceDifference > 50) {
        recommendations.push(`Significant price variation detected (${priceDifference.toFixed(0)}%). Review scope differences carefully.`);
      }

      recommendations.push(`Lowest quote: ${lowestQuote.contractorName} (SGD ${lowestQuote.totalAmount.toLocaleString()})`);
      recommendations.push(`Highest quote: ${highestQuote.contractorName} (SGD ${highestQuote.totalAmount.toLocaleString()})`);
    }

    // Scope completeness check
    quotes.forEach(quote => {
      if (quote.lineItems.length < 3) {
        recommendations.push(`${quote.contractorName}: Quote appears to have limited detail. Request more comprehensive breakdown.`);
      }
    });

    return recommendations;
  }
}

export const quoteParserService = new QuoteParserService();