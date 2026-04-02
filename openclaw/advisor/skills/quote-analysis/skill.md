# Quote Analysis Skill

## Purpose
Help homeowners understand, compare, and evaluate contractor quotes. Identify missing scope, vague descriptions, and potential issues in renovation quotes. Provide structured analysis without offering legal or contractual advice.

## Trigger Conditions
- User uploads a quote document (PDF, image, etc.)
- User asks "Does this quote look complete?"
- User wants to compare multiple quotes
- User mentions receiving quotes from contractors
- User is concerned about quote clarity or fairness

## Required Inputs
### Primary Inputs
1. **Quote Document**: PDF, image, or document file
2. **Project Context**: Brief description of the renovation project
3. **User Concerns**: Specific questions or worries about the quote

### Helpful Additional Inputs
- Contractor name and reputation (if known)
- Project timeline and constraints
- User's budget expectations
- Other quotes for comparison
- Any red flags user has noticed

## How to Invoke
### Through File Upload
```
User uploads quote document
System automatically triggers quote analysis
Advisor: "I'll analyze this quote for you..."
```

### Through Conversation
```
User: "I got this quote from a contractor"
Advisor: "Would you like me to analyze it? You can upload the document."
[User uploads, system processes]
Advisor: "Here's my analysis of the quote..."
```

### Analysis Process
1. **Document Processing**: Extract text via OCR (if needed)
2. **Key Information Extraction**: Contractor, total, scope items
3. **Structure Analysis**: Check for clear sections and organization
4. **Completeness Check**: Compare to typical quote components
5. **Clarity Assessment**: Identify vague or ambiguous language
6. **Comparison**: Match against project scope and budget expectations
7. **Issue Flagging**: Note potential problems or missing items
8. **Summary Generation**: Create user-friendly analysis

## Output Format Expectations
### Standard Analysis Format
```
## Quote Analysis: [Contractor Name]

### Quote Summary
- **Contractor**: [Name]
- **Total Amount**: SGD [Amount]
- **Quote Date**: [Date]
- **Validity Period**: [If stated]
- **Payment Terms**: [If specified]

### Scope Analysis
**Included Items:**
1. [Item 1 with description]
2. [Item 2 with description]
3. [Item 3 with description]

**Potentially Missing Items** (based on typical projects):
- [Common item 1]
- [Common item 2]
- [Common item 3]

**Vague or Unclear Descriptions:**
- "[Quote text]" - Unclear what this includes
- "[Quote text]" - No specifications provided

### Financial Analysis
- **Breakdown Clarity**: [Good/Fair/Poor] - How well costs are itemized
- **Contingency Allowance**: [Present/Absent] - For unexpected issues
- **Payment Schedule**: [Clear/Unclear] - Milestone payments

### Comparison Context
- **vs. Estimated Range**: [Within/Below/Above] typical range of SGD X-XX
- **vs. Project Scope**: [Matches/Exceeds/Falls short] of discussed scope
- **Value Assessment**: [Good/Fair/Questionable] value based on included items

### Red Flags & Concerns
⚠️ **[Severity]**: [Description of concern]
⚠️ **[Severity]**: [Description of concern]

### Green Flags & Strengths
✅ **[Strength]**: [Description of positive aspect]
✅ **[Strength]**: [Description of positive aspect]

### Questions to Ask Contractor
1. [Question about vague item]
2. [Question about missing scope]
3. [Question about payment terms]
4. [Question about timeline]

### Recommended Next Steps
1. [Immediate action]
2. [Follow-up action]
3. [Comparison action if applicable]
```

### Simplified Output (for quick review)
```
Quote from [Contractor]: SGD [Amount]
Scope: [Brief summary]
Missing: [Key missing items]
Concerns: [Main concerns]
Next: [Recommended questions]
```

## Limitations
### Analysis Capabilities
- CAN identify missing typical scope items
- CAN flag vague language and descriptions
- CAN compare to estimated budget ranges
- CAN highlight unusual terms or conditions
- CAN suggest questions for clarification

### Analysis Limitations
- CANNOT verify contractor credentials or reputation
- CANNOT assess quality of materials or workmanship
- CANNOT provide legal or contractual advice
- CANNOT guarantee quote accuracy or fairness
- CANNOT replace professional quantity surveying

### Technical Limitations
- OCR accuracy depends on document quality
- Handwritten notes may not be readable
- Complex tables or formatting may not parse correctly
- Non-English quotes may have translation issues
- Password-protected documents cannot be processed

## Examples
### Example 1: Complete Kitchen Quote
```
## Quote Analysis: Kitchen Renovation Specialists

### Quote Summary
- **Contractor**: Kitchen Renovation Specialists
- **Total Amount**: SGD 28,500
- **Quote Date**: 2024-03-15
- **Validity**: 30 days
- **Payment**: 30% deposit, balance on completion

### Scope Analysis
**Included Items:**
1. Demolition and disposal of existing kitchen
2. New cabinets (melamine, 18mm thickness)
3. Quartz countertops (2cm thickness)
4. Sink and tapware (specified brands)
5. Basic backsplash (ceramic tiles)
6. Electrical points (6 new points)
7. Painting (walls and ceiling)

**Potentially Missing Items:**
- Appliances (oven, hob, hood, refrigerator)
- Flooring (assumes existing floor stays)
- Lighting fixtures (only electrical points)
- Plumbing modifications (if changing layout)
- Permit applications and fees

**Vague Descriptions:**
- "Quality materials" - No specifications
- "Professional installation" - No details on crew or timeline

### Financial Analysis
- **Breakdown Clarity**: Fair - Some items grouped together
- **Contingency Allowance**: Absent - No allowance for unexpected issues
- **Payment Schedule**: Clear - 30% deposit, 70% on completion

### Comparison Context
- **vs. Estimated Range**: Within typical SGD 25,000-35,000 range
- **vs. Project Scope**: Matches discussed kitchen renovation
- **Value Assessment**: Fair value for included items

### Red Flags & Concerns
⚠️ **Medium**: No contingency allowance for unexpected issues
⚠️ **Low**: Vague "quality materials" without specifications

### Green Flags & Strengths
✅ **Clear**: Specific cabinet and countertop materials
✅ **Reasonable**: Payment terms typical for industry
✅ **Complete**: Includes demolition, installation, painting

### Questions to Ask Contractor
1. Which specific appliance brands are included/excluded?
2. Is flooring included or does existing floor stay?
3. What is the estimated timeline for completion?
4. Who handles permit applications and associated costs?
5. Can you provide references for similar projects?

### Recommended Next Steps
1. Request clarification on missing items (appliances, flooring)
2. Ask for more specific material specifications
3. Get 2 more quotes for comparison
4. Check contractor license and references
```

### Example 2: Vague Bathroom Quote
```
## Quote Analysis: Quick Bathroom Reno

### Quote Summary
- **Contractor**: Quick Bathroom Reno
- **Total Amount**: SGD 8,500
- **Quote Date**: 2024-03-10
- **Validity**: Not specified
- **Payment**: 50% deposit required

### Scope Analysis
**Included Items:**
1. Bathroom renovation
2. New tiles and fixtures
3. Plumbing work

**Potentially Missing Items:**
- Specific tile types and sizes
- Fixture brands and models
- Demolition and disposal
- Waterproofing details
- Ventilation requirements
- Lighting specifications
- Mirror and accessories
- Permit information

**Vague Descriptions:**
- "Bathroom renovation" - Extremely vague
- "New tiles and fixtures" - No specifications
- "Plumbing work" - Unclear what's included

### Financial Analysis
- **Breakdown Clarity**: Poor - No itemized breakdown
- **Contingency Allowance**: Not mentioned
- **Payment Schedule**: Concerning - 50% deposit is high

### Comparison Context
- **vs. Estimated Range**: Below typical SGD 10,000-15,000 range
- **vs. Project Scope**: Vague - Cannot assess if matches scope
- **Value Assessment**: Cannot assess - Too vague

### Red Flags & Concerns
⚠️ **High**: Extremely vague scope with no specifications
⚠️ **High**: No itemized breakdown of costs
⚠️ **High**: 50% deposit requirement (industry standard is 20-30%)
⚠️ **Medium**: Below typical price range for full bathroom reno

### Green Flags & Strengths
✅ **Quick**: Quote provided promptly
✅ **Simple**: Easy to understand (but too simple)

### Questions to Ask Contractor
1. Can you provide detailed specifications for all materials?
2. What is included in "plumbing work" specifically?
3. Can you break down the SGD 8,500 into line items?
4. Why is a 50% deposit required?
5. What is not included in this quote?
6. Can you provide references and license information?

### Recommended Next Steps
1. Do not proceed with this quote in current form
2. Request detailed, itemized quote with specifications
3. Get quotes from 2-3 other licensed contractors
4. Verify contractor license and insurance
5. Consider this a red flag and proceed with caution
```

## Best Practices
### Analysis Guidelines
- **Be objective**: Focus on facts, not opinions
- **Flag clearly**: Use consistent severity levels
- **Provide context**: Compare to typical projects
- **Suggest actions**: Always recommend next steps
- **Stay in scope**: Don't offer legal or engineering advice

### Communication Guidelines
- **Acknowledge limits**: "I can analyze the quote structure, but..."
- **Encourage professional advice**: "For contractual matters, consult..."
- **Be constructive**: Focus on how to improve, not just criticize
- **Empower user**: Give them questions to ask contractors
- **Set expectations**: "Analysis is based on typical practices"

### User Experience
- **Start positive**: Acknowledge receiving quotes is progress
- **Educate**: Explain what makes a good quote
- **Simplify**: Make complex analysis understandable
- **Actionable**: Provide clear next steps
- **Supportive**: Renovation is stressful, be encouraging

## Integration with Other Skills
### Cost Estimation
- Compare quote amounts to estimated ranges
- Flag significant deviations from estimates
- Use estimates to identify potentially missing items

### Renovation Intake
- Compare quote scope to project brief
- Identify gaps between discussed scope and quoted scope
- Suggest brief updates based on quote analysis

### Memory Management
- Store contractor preferences (good or bad experiences)
- Note budget realities vs expectations
- Remember user's quote analysis patterns

## Success Metrics
- Users understand their quotes better after analysis
- Users can ask better questions to contractors
- Analysis helps identify potential issues early
- Users feel more confident in quote evaluation
- Analysis leads to better contractor selection
- Users avoid problematic quotes based on red flags
