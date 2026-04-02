# Tools - Estimator Agent

## Available Tools

### 1. Rule Table Calculator
#### Purpose
Apply predefined rule tables and multipliers to generate cost estimates based on input parameters.

#### Input Requirements
**Mandatory:**
- Property type (string)
- Style tier (budget/standard/premium)
- Kitchen redo (boolean)
- Bathroom count (integer)
- Carpentry level (low/medium/high)
- Electrical scope (basic/moderate/full)
- Painting (boolean)

**Optional:**
- Budget constraint (number)
- Property size (number, square meters)
- Specific material adjustments (object)

#### Calculation Process
1. **Rule Selection**: Find matching rule for property type + style tier
2. **Base Calculation**: Apply base rate × area (default or provided)
3. **Scope Application**: Apply multipliers for kitchen, bathrooms
4. **Quality Adjustment**: Apply carpentry, electrical multipliers
5. **Painting Application**: Apply painting multiplier if needed
6. **Constraint Check**: Adjust if budget constraint provided
7. **Range Generation**: Calculate lean, realistic, stretch ranges
8. **Confidence Scoring**: Rate estimate reliability
9. **Assumption Documentation**: Record all assumptions made
10. **Cost Driver Identification**: Identify major cost components

#### Output Format
```json
{
  "estimate": {
    "lean": {"min": number, "max": number},
    "realistic": {"min": number, "max": number},
    "stretch": {"min": number, "max": number}
  },
  "confidence": "high|medium|low",
  "assumptions": ["assumption1", "assumption2", ...],
  "costDrivers": [
    {"component": "string", "percentage": number},
    ...
  ],
  "exclusions": ["exclusion1", "exclusion2", ...],
  "notes": ["note1", "note2", ...]
}
```

#### Error Handling
- **Missing inputs**: Return specific error about missing parameter
- **Invalid combinations**: Return error with valid options
- **Rule not found**: Use fallback rule with lower confidence
- **Calculation error**: Return error with context

### 2. Confidence Scorer
#### Purpose
Rate estimate reliability based on input quality and scenario commonality.

#### Scoring Factors
**High Confidence (0.8-1.0):**
- All mandatory inputs provided
- Common property type (HDB, Condo)
- Clear scope definitions
- Budget constraint provided
- Typical scenario

**Medium Confidence (0.5-0.7):**
- Most inputs provided
- Some assumptions needed
- Less common property types
- No budget constraint
- Moderate variability

**Low Confidence (0.3-0.5):**
- Missing critical inputs
- Unusual property types
- High variability scenarios
- Many assumptions needed
- Limited rule coverage

**Very Low Confidence (<0.3):**
- Insufficient information
- Extreme edge cases
- Recommend professional quote
- Don't provide estimate

#### Output
- Confidence level (high/medium/low)
- Explanation of scoring factors
- Suggestions for improving confidence

### 3. Assumption Documenter
#### Purpose
Record all assumptions made during estimation for transparency.

#### Standard Assumptions
1. **Area assumption**: Default square meters if not provided
2. **Layout assumption**: Standard layout if not specified
3. **Material assumption**: Mid-range materials if not specified
4. **Labor assumption**: Standard labor rates and timelines
5. **Site assumption**: Normal site conditions and access

#### Custom Assumptions
- Based on missing inputs
- Based on input combinations
- Based on constraint adjustments
- Based on rule limitations

#### Output Format
- List of assumptions with context
- Flag for critical assumptions
- Suggestions for validating assumptions

### 4. Cost Driver Analyzer
#### Purpose
Identify which components contribute most to total cost.

#### Analysis Method
1. Calculate component costs based on rules
2. Determine percentage of total for each
3. Identify top 3-5 drivers
4. Provide context about each driver

#### Common Cost Drivers
- Kitchen cabinetry and countertops
- Bathroom fixtures and tiling
- Custom carpentry and built-ins
- Electrical and lighting systems
- Flooring materials and installation
- Painting and finishes

#### Output
- Ranked list of cost drivers
- Percentage contribution for each
- Typical range for each component
- Suggestions for cost reduction

### 5. Range Generator
#### Purpose
Convert base cost into appropriate ranges for planning.

#### Range Logic
- **Lean Range (70-90%)**: Basic materials, minimal changes, value focus
- **Realistic Range (90-120%)**: Good quality, typical scope, balanced approach
- **Stretch Range (120-150%)**: Premium materials, full scope, luxury options

#### Adjustment Factors
- **Input quality**: Wider ranges for lower confidence
- **Scenario variability**: Wider ranges for unusual scenarios
- **Market volatility**: Adjust based on current market conditions
- **Seasonal factors**: Consider time of year impacts

#### Output
- Three distinct ranges with descriptions
- Context for when each range applies
- Guidance on which range to use for planning

## Tool Integration

### Input Validation Chain
1. **Validator**: Check all inputs for type and range
2. **Normalizer**: Convert inputs to standard formats
3. **Enricher**: Add default values for missing optional inputs
4. **Validator**: Check for logical conflicts

### Calculation Pipeline
1. **Rule Selector**: Choose appropriate rule table
2. **Base Calculator**: Calculate base cost
3. **Multiplier Applier**: Apply scope and quality multipliers
4. **Constraint Checker**: Apply budget constraints if provided
5. **Range Generator**: Create three budget ranges
6. **Confidence Scorer**: Rate estimate reliability
7. **Documenter**: Record all assumptions and decisions

### Output Assembly
1. **Formatter**: Structure output according to schema
2. **Enricher**: Add explanatory text and context
3. **Validator**: Check output for completeness and consistency
4. **Presenter**: Prepare for delivery to advisor

## Error Handling Tools

### 1. Input Validator
- Check mandatory field presence
- Validate data types and ranges
- Detect conflicting inputs
- Suggest corrections for invalid inputs

### 2. Error Classifier
- Categorize errors by type and severity
- Determine appropriate response
- Select recovery strategy
- Log error details for analysis

### 3. Fallback Handler
- Select alternative rules when primary fails
- Apply conservative assumptions
- Generate estimates with appropriate confidence
- Document fallback usage clearly

### 4. Error Reporter
- Format error messages for users
- Provide guidance for correction
- Suggest alternative approaches
- Maintain system stability

## Monitoring Tools

### 1. Performance Monitor
- Track calculation times
- Monitor error rates
- Measure rule coverage
- Assess system load

### 2. Accuracy Tracker
- Compare estimates to actual quotes
- Calculate estimate accuracy
- Identify rule inaccuracies
- Suggest rule improvements

### 3. Usage Analyzer
- Track most common scenarios
- Identify rule gaps
- Monitor input patterns
- Analyze confidence distribution

### 4. Health Checker
- Verify tool accessibility
- Test calculation accuracy
- Check integration points
- Report system status

## Tool Usage Guidelines

### Before Calculation
1. **Validate all inputs** thoroughly
2. **Check for missing information**
3. **Identify potential issues**
4. **Prepare fallback strategies**

### During Calculation
1. **Follow defined algorithms** exactly
2. **Document all assumptions**
3. **Handle errors gracefully**
4. **Maintain calculation integrity**

### After Calculation
1. **Verify output completeness**
2. **Check for logical consistency**
3. **Rate confidence appropriately**
4. **Prepare for delivery**

### Quality Assurance
1. **Regular tool testing**
2. **Accuracy validation**
3. **Performance monitoring**
4. **Continuous improvement**

## Security Considerations

### Input Security
- Validate all inputs to prevent injection
- Sanitize data before processing
- Limit input size and complexity
- Log suspicious input patterns

### Calculation Security
- Protect rule tables from unauthorized modification
- Ensure calculation integrity
- Prevent calculation manipulation
- Secure intermediate results

### Output Security
- Sanitize output before delivery
- Limit sensitive information exposure
- Control output format and content
- Log output for audit purposes

### System Security
- Regular security updates
- Vulnerability scanning
- Access control enforcement
- Incident response planning

## Maintenance Tools

### 1. Rule Updater
- Apply rule table updates
- Validate new rules
- Test rule combinations
- Deploy updates safely

### 2. Configuration Manager
- Manage tool configurations
- Handle environment variables
- Control feature flags
- Maintain version information

### 3. Backup Tool
- Regular rule table backups
- Configuration backups
- Performance data backups
- Disaster recovery planning

### 4. Log Manager
- Collect and store logs
- Analyze log patterns
- Generate reports
- Maintain log retention

## Success Metrics
- Calculation accuracy > 95%
- Average processing time < 2 seconds
- Error rate < 0.5%
- Rule coverage > 98%
- User satisfaction > 90%
- System availability > 99.9%
