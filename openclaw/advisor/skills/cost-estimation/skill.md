# Cost Estimation Skill

## Purpose
Provide homeowners with realistic budget ranges for renovation projects using deterministic rule tables and multipliers. Help users understand cost drivers, trade-offs, and budget planning without pretending to provide exact quotes.

## Trigger Conditions
- User asks "How much will this cost?" or similar
- User provides sufficient project details for estimation
- User wants to explore budget scenarios
- Preparing for contractor discussions
- Comparing different scope options

## Required Inputs
### Mandatory Inputs
1. **Property Type**: HDB BTO, HDB Resale, Condo, Landed, etc.
2. **Style Tier**: Budget, Standard, or Premium
3. **Kitchen Redo**: Yes/No (full renovation)
4. **Bathroom Count**: Number of bathrooms being renovated
5. **Carpentry Level**: Low (basic), Medium (custom), High (full custom)
6. **Electrical Scope**: Basic (outlets/lights), Moderate (rewiring), Full (smart home)
7. **Painting**: Yes/No (full repaint)

### Optional Inputs
- **Budget Constraint**: Maximum budget to work within
- **Property Size**: Square meters (if known, otherwise use defaults)
- **Specific Materials**: If user has strong preferences affecting cost
- **Timeline**: Rush vs standard timing (affects labor costs)

## How to Invoke
### Through Advisor Conversation
```
Advisor: "Based on what you've shared, I can give you budget ranges. Let me use the cost estimator..."

[System calls estimator with collected parameters]
```

### Direct User Request
```
User: "Can you estimate costs for a 4-room HDB kitchen redo?"
Advisor: "Sure! I'll need a few details first..."
[Collect missing parameters, then invoke]
```

### Estimation Process
1. **Parameter Validation**: Ensure all mandatory inputs are present
2. **Rule Selection**: Find matching rule based on property type and style tier
3. **Base Calculation**: Apply base rate per square meter
4. **Multiplier Application**: Apply multipliers for scope items
5. **Range Generation**: Calculate lean, realistic, and stretch ranges
6. **Assumption Documentation**: Note all assumptions made
7. **Confidence Scoring**: Rate estimate confidence based on input quality

## Output Format Expectations
### Standard Output Format
```
## Budget Estimate

**Property**: [Type]
**Style**: [Tier]
**Scope**: [Brief description]

### Budget Ranges
- **Lean Range**: SGD X,XXX - X,XXX  
  *(Basic materials, minimal changes, value-focused)*
- **Realistic Range**: SGD X,XXX - X,XXX
  *(Good quality, typical scope, balanced approach)*
- **Stretch Range**: SGD X,XXX - X,XXX
  *(Premium materials, full scope, luxury options)*

### Confidence: [High/Medium/Low]
[Explanation of confidence level]

### Key Assumptions
1. [Assumption 1]
2. [Assumption 2]
3. [Assumption 3]

### Major Cost Drivers
- [Driver 1]: ~X% of total
- [Driver 2]: ~Y% of total
- [Driver 3]: ~Z% of total

### Important Notes
- These are estimates, not quotes
- Does not include GST, permits, or unexpected costs
- Actual quotes may vary based on site conditions
- Recommend getting 3+ contractor quotes
```

### Simplified Output (for quick conversations)
```
Typical range: SGD X,XXX - X,XXX for similar projects
Main costs: [Kitchen, bathrooms, carpentry, etc.]
Confidence: [Level] based on information provided
```

## Limitations
### What Estimates CAN Do
- Provide typical market ranges
- Show cost trade-offs between options
- Help with budget planning
- Identify major cost drivers
- Set realistic expectations

### What Estimates CANNOT Do
- Provide exact quotes
- Account for unique site conditions
- Include all possible scope items
- Guarantee contractor pricing
- Replace professional quotations

### Known Limitations
1. **Market Variability**: Prices change with market conditions
2. **Site Specifics**: Unique layouts, access issues, existing conditions
3. **Material Fluctuation**: Material costs vary by supplier, timing
4. **Labor Rates**: Vary by contractor, season, location
5. **Hidden Costs**: Permits, disposal, temporary arrangements

## Examples
### Example 1: HDB Kitchen Renovation
```
User: "How much to redo my HDB kitchen?"
Inputs: HDB BTO, Standard style, Kitchen: Yes, Bathrooms: 0, Carpentry: Medium, Electrical: Moderate, Painting: Yes

Output:
## Budget Estimate
**Property**: HDB BTO (assumed 90 sqm)
**Style**: Standard
**Scope**: Kitchen renovation, electrical updates, painting

### Budget Ranges
- **Lean**: SGD 18,000 - 25,000
- **Realistic**: SGD 25,000 - 35,000  
- **Stretch**: SGD 35,000 - 45,000

### Confidence: Medium
Based on typical HDB kitchen projects

### Key Assumptions
1. Standard kitchen layout (L-shaped or U-shaped)
2. Mid-range cabinets and countertops
3. Includes appliances (oven, hob, hood)
4. Basic backsplash and flooring
5. Does not include structural changes

### Major Cost Drivers
- Cabinets & countertops: ~40%
- Appliances: ~25%
- Labor & installation: ~20%
- Electrical & plumbing: ~15%
```

### Example 2: Condo Whole Unit Refresh
```
User: "What's the budget to refresh my entire condo?"
Inputs: Condo, Premium style, Kitchen: Yes, Bathrooms: 2, Carpentry: High, Electrical: Full, Painting: Yes

Output:
## Budget Estimate
**Property**: Condo (assumed 100 sqm)
**Style**: Premium
**Scope**: Full unit refresh with premium finishes

### Budget Ranges
- **Lean**: SGD 60,000 - 80,000
- **Realistic**: SGD 80,000 - 120,000
- **Stretch**: SGD 120,000 - 160,000

### Confidence: Low to Medium
Premium projects have high variability

### Key Assumptions
1. No structural changes or layout modifications
2. Premium materials throughout
3. Smart home electrical system
4. Custom carpentry for storage
5. Designer-level finishes

### Major Cost Drivers
- Custom carpentry: ~35%
- Premium materials: ~30%
- Electrical & smart home: ~20%
- Labor & design fees: ~15%
```

## Best Practices
### Communication Guidelines
- **Always qualify**: "This is an estimate, not a quote"
- **Explain assumptions**: Be transparent about what's included
- **Discuss confidence**: Lower confidence needs more disclaimers
- **Suggest next steps**: "Get 3 quotes to validate"
- **Avoid precision**: Use ranges, not exact numbers

### Estimation Guidelines
- **Conservative default**: When uncertain, use conservative estimates
- **Document everything**: All assumptions must be documented
- **Flag uncertainties**: Clearly note where estimates are less reliable
- **Update rules**: Keep rule tables current with market changes
- **Review accuracy**: Periodically compare estimates to actual quotes

### User Experience
- **Set expectations early**: "I can give you ranges based on typical projects"
- **Ask for missing info**: "To be more accurate, I'd need to know..."
- **Offer scenarios**: "If you choose budget vs premium materials..."
- **Connect to reality**: "This means you might need to save for X months"
- **Provide context**: "Compared to similar projects in your area..."

## Integration with Other Skills
### Renovation Intake
- Use project brief as estimation input
- Flag missing information needed for accurate estimates
- Suggest refining brief based on budget realities

### Memory Management
- Store budget preferences as long-term memory
- Note budget constraints for future reference
- Update estimates as project scope evolves

### Quote Analysis
- Compare quotes to estimated ranges
- Flag quotes significantly outside ranges
- Use estimates to evaluate quote completeness

## Success Metrics
- Users understand estimates are ranges, not quotes
- Estimates help with budget planning and reality checks
- Users feel informed about cost drivers and trade-offs
- Estimates are reasonably aligned with eventual quotes
- Users know next steps after receiving estimates
