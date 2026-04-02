# Cost Estimation Skill (Estimator Agent)

## Purpose
Provide deterministic cost calculations for renovation projects using rule tables and multipliers. Generate budget ranges with clear assumptions, confidence scores, and cost driver analysis.

## Trigger Conditions
- Advisor agent requests cost estimation
- All mandatory inputs are provided or can be reasonably assumed
- Project scenario matches available rule coverage
- User needs budget ranges for planning or comparison

## Required Inputs
### Mandatory Inputs (from Advisor)
1. **propertyType**: String (HDB BTO, HDB Resale, Condo, Landed, etc.)
2. **styleTier**: String (budget, standard, premium)
3. **kitchenRedo**: Boolean (true/false)
4. **bathroomCount**: Integer (0-10)
5. **carpentryLevel**: String (low, medium, high)
6. **electricalScope**: String (basic, moderate, full)
7. **painting**: Boolean (true/false)

### Optional Inputs
8. **budgetConstraint**: Number (maximum budget in SGD)
9. **propertySize**: Number (square meters)
10. **materialPreferences**: Object (specific material choices)
11. **timelineConstraints**: Object (rush vs standard timing)

### Derived Inputs (if not provided)
- **propertySize**: Default based on property type
- **layoutComplexity**: Assumed standard unless specified
- **siteConditions**: Assumed normal unless specified
- **laborRates**: Current market standard rates

## How to Invoke
### API Call Format
```json
{
  "action": "estimate",
  "parameters": {
    "propertyType": "HDB BTO",
    "styleTier": "standard",
    "kitchenRedo": true,
    "bathroomCount": 2,
    "carpentryLevel": "medium",
    "electricalScope": "moderate",
    "painting": true,
    "budgetConstraint": 60000,
    "propertySize": 90
  }
}
```

### Calculation Process
1. **Input Validation**: Check all mandatory inputs, validate ranges
2. **Rule Selection**: Find matching rule for propertyType + styleTier
3. **Base Calculation**: Calculate base cost = baseRate × propertySize
4. **Scope Application**: 
   - If kitchenRedo: baseCost × kitchenMultiplier
   - Add bathroomCost = bathroomCount × bathroomRate
5. **Quality Adjustment**:
   - baseCost × carpentryMultiplier[carpentryLevel]
   - baseCost × electricalMultiplier[electricalScope]
6. **Painting Application**: If painting: baseCost × paintingMultiplier
7. **Constraint Check**: If budgetConstraint and baseCost > constraint: adjust
8. **Range Generation**:
   - leanMin = baseCost × 0.7, leanMax = baseCost × 0.9
   - realisticMin = baseCost × 0.9, realisticMax = baseCost × 1.2
   - stretchMin = baseCost × 1.2, stretchMax = baseCost × 1.5
9. **Confidence Scoring**: Rate based on input completeness and scenario
10. **Assumption Documentation**: Record all assumptions made
11. **Cost Driver Analysis**: Identify top 3-5 cost components

### Output Format
```json
{
  "success": true,
  "estimate": {
    "propertyType": "HDB BTO",
    "styleTier": "standard",
    "scopeDescription": "Kitchen renovation, 2 bathrooms, medium carpentry, moderate electrical, painting",
    "ranges": {
      "lean": {"min": 45000, "max": 58000, "description": "Basic materials, minimal changes"},
      "realistic": {"min": 58000, "max": 77000, "description": "Good quality, typical scope"},
      "stretch": {"min": 77000, "max": 96000, "description": "Premium materials, full scope"}
    },
    "confidence": {
      "level": "medium",
      "score": 0.65,
      "factors": ["All mandatory inputs provided", "Common property type", "No budget constraint provided"]
    },
    "assumptions": [
      "Property size: 90 sqm (default for HDB BTO)",
      "Standard layout complexity",
      "Mid-range material quality for 'standard' tier",
      "Normal site conditions and access"
    ],
    "costDrivers": [
      {"component": "Kitchen renovation", "percentage": 40, "typicalRange": "SGD 20,000-30,000"},
      {"component": "Bathrooms (2)", "percentage": 30, "typicalRange": "SGD 15,000-25,000"},
      {"component": "Carpentry & built-ins", "percentage": 20, "typicalRange": "SGD 10,000-15,000"},
      {"component": "Electrical & painting", "percentage": 10, "typicalRange": "SGD 5,000-8,000"}
    ],
    "exclusions": [
      "GST (8%)",
      "Permit fees",
      "Appliances (oven, hob, refrigerator)",
      "Furniture and decor",
      "Professional design fees"
    ],
    "notes": [
      "Estimates based on typical Singapore market rates Q1 2024",
      "Actual costs may vary ±20% based on specific conditions",
      "Recommend getting 3+ contractor quotes for accuracy"
    ]
  }
}
```

## Error Handling
### Validation Errors
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Missing required parameter: propertyType",
  "details": {
    "missing": ["propertyType"],
    "invalid": [],
    "suggestions": ["Provide propertyType: HDB BTO, Condo, Landed, etc."]
  }
}
```

### Rule Not Found
```json
{
  "success": false,
  "error": "rule_not_found",
  "message": "No rule found for propertyType: 'Mansion' with styleTier: 'premium'",
  "details": {
    "availablePropertyTypes": ["HDB BTO", "HDB Resale", "Condo", "Landed", "Commercial"],
    "availableStyleTiers": ["budget", "standard", "premium"],
    "suggestion": "Use 'Landed' with 'premium' as closest match"
  }
}
```

### Calculation Error
```json
{
  "success": false,
  "error": "calculation_error",
  "message": "Error calculating bathroom costs: bathroomCount must be between 0 and 10",
  "details": {
    "parameter": "bathroomCount",
    "value": 15,
    "validRange": "0-10",
    "suggestion": "Adjust bathroomCount to valid range"
  }
}
```

## Rule Tables Structure
### Base Rules (example)
```json
{
  "HDB BTO": {
    "budget": {
      "baseRatePerSqm": 450,
      "kitchenMultiplier": 1.2,
      "bathroomRate": 8000,
      "carpentryMultipliers": {"low": 1.0, "medium": 1.3, "high": 1.8},
      "electricalMultipliers": {"basic": 1.0, "moderate": 1.2, "full": 1.5},
      "paintingMultiplier": 1.0,
      "defaultAreaSqm": 90
    },
    "standard": {
      "baseRatePerSqm": 650,
      "kitchenMultiplier": 1.5,
      "bathroomRate": 12000,
      "carpentryMultipliers": {"low": 1.2, "medium": 1.6, "high": 2.2},
      "electricalMultipliers": {"basic": 1.1, "moderate": 1.4, "full": 1.8},
      "paintingMultiplier": 1.2,
      "defaultAreaSqm": 90
    },
    "premium": {
      "baseRatePerSqm": 900,
      "kitchenMultiplier": 2.0,
      "bathroomRate": 18000,
      "carpentryMultipliers": {"low": 1.5, "medium": 2.0, "high": 3.0},
      "electricalMultipliers": {"basic": 1.3, "moderate": 1.7, "full": 2.2},
      "paintingMultiplier": 1.5,
      "defaultAreaSqm": 90
    }
  }
}
```

## Confidence Scoring Algorithm
### Scoring Factors (each 0-1)
1. **Input Completeness**: 1.0 if all mandatory inputs provided, reduce for missing
2. **Property Commonality**: 1.0 for common types (HDB, Condo), 0.5 for rare types
3. **Scope Clarity**: 1.0 if all scope items clearly defined, reduce for vagueness
4. **Constraint Information**: 0.8 if budget constraint provided, 0.5 if not
5. **Scenario Typicality**: 1.0 for common scenarios, reduce for edge cases

### Final Confidence
- **High**: Average score ≥ 0.8
- **Medium**: 0.5 ≤ Average score < 0.8
- **Low**: Average score < 0.5

## Examples
### Example 1: Complete HDB Renovation
```json
Input:
{
  "propertyType": "HDB BTO",
  "styleTier": "standard",
  "kitchenRedo": true,
  "bathroomCount": 2,
  "carpentryLevel": "medium",
  "electricalScope": "moderate",
  "painting": true,
  "budgetConstraint": 80000,
  "propertySize": 90
}

Output Confidence: High (0.85)
```

### Example 2: Partial Condo Update
```json
Input:
{
  "propertyType": "Condo",
  "styleTier": "premium",
  "kitchenRedo": false,
  "bathroomCount": 1,
  "carpentryLevel": "high",
  "electricalScope": "basic",
  "painting": true
  // No propertySize, no budgetConstraint
}

Output Confidence: Medium (0.65)
```

### Example 3: Minimal Information
```json
Input:
{
  "propertyType": "Landed",
  "styleTier": "budget",
  "kitchenRedo": true,
  "bathroomCount": 3,
  "carpentryLevel": "low",
  "electricalScope": "basic",
  "painting": false
  // Missing many optional inputs, landed has high variability
}

Output Confidence: Low (0.45)
```

## Limitations
### What This Skill Can Do
- Provide market-based budget ranges
- Show cost trade-offs between options
- Help with initial budget planning
- Identify major cost components
- Set realistic expectations

### What This Skill Cannot Do
- Provide exact quotes or final pricing
- Account for unique site conditions
- Include all possible scope variations
- Guarantee contractor pricing
- Replace professional quantity surveying

### Known Limitations
1. **Market Timing**: Prices change with market conditions
2. **Site Specifics**: Unique layouts, access issues, existing conditions
3. **Material Fluctuation**: Material costs vary by supplier and timing
4. **Labor Variability**: Labor rates vary by contractor and season
5. **Hidden Costs**: Permits, disposal, temporary arrangements not included

## Maintenance Requirements
### Regular Updates
- **Monthly**: Review and adjust base rates for market changes
- **Quarterly**: Update rule tables based on actual quote data
- **Annually**: Comprehensive rule table overhaul

### Performance Monitoring
- Track estimate accuracy vs actual quotes
- Monitor confidence score reliability
- Analyze most common estimation scenarios
- Identify rule gaps or inaccuracies

### Quality Assurance
- Regular testing of calculation algorithms
- Validation of rule table consistency
- Performance benchmarking
- User feedback incorporation

## Integration Points
### With Advisor Agent
- Advisor collects user inputs and context
- Advisor calls this skill with structured parameters
- Advisor presents results to user with appropriate framing
- Advisor handles follow-up questions and scenarios

### With Memory System
- Estimates may be stored as project memories
- Cost preferences may inform future estimates
- Budget decisions become reference points
- Estimation patterns inform rule improvements

### With Quote Analysis
- Estimates provide baseline for quote evaluation
- Quote data informs rule table updates
- Comparison between estimates and quotes
- Identification of quote outliers

## Success Metrics
- Estimate accuracy within ±20% of actual quotes
- Confidence scores correlate with actual accuracy
- User satisfaction with estimate usefulness
- Reduction in budget surprise incidents
- Improved financial planning outcomes
- Positive advisor feedback on integration
