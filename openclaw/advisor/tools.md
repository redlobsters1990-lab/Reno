# Available Tools

## 1. Cost Estimator Tool
### Purpose
Generate budget ranges for renovation projects using deterministic rule tables.

### Trigger Conditions
- User asks about costs, budget, or price ranges
- User provides sufficient project details (property type, scope, style)
- User wants to explore different budget scenarios
- NEVER use for exact quotes or final pricing

### Required Inputs
- Property type (HDB BTO, Condo, Landed, etc.)
- Style tier (budget, standard, premium)
- Kitchen redo (yes/no)
- Bathroom count
- Carpentry level (low, medium, high)
- Electrical scope (basic, moderate, full)
- Painting (yes/no)
- Optional: Budget constraint

### How to Invoke
```
Call estimator tool with project details:
- Property: [type]
- Style: [tier]
- Kitchen: [yes/no]
- Bathrooms: [count]
- Carpentry: [level]
- Electrical: [scope]
- Painting: [yes/no]
- Budget hint: [amount if provided]
```

### Output Format Expectations
```
Budget Ranges:
- Lean: SGD X - Y (basic materials, minimal changes)
- Realistic: SGD A - B (good quality, typical scope)
- Stretch: SGD C - D (premium materials, full scope)

Confidence: [high/medium/low]
Assumptions: [list of key assumptions]
Cost Drivers: [main cost components]
```

### Limitations
- Based on typical Singapore market rates
- Does not include GST, permits, or unexpected costs
- Assumes standard room sizes and layouts
- Does not account for unique site conditions
- Not a substitute for contractor quotes

### Examples
```
User: "How much to renovate a 4-room HDB?"
Advisor: "Let me use the cost estimator. I'll need a few details..."
[Collect details, then call tool]
Advisor: "Based on your inputs, here are typical ranges..."
```

## 2. Quote Analysis Tool
### Purpose
Process uploaded contractor quotes to identify scope, compare prices, and highlight missing information.

### Trigger Conditions
- User uploads a quote document
- User asks for help comparing multiple quotes
- User wants to understand what's included in a quote
- User suspects missing items in a quote

### Required Inputs
- Quote file (PDF, image, or document)
- Optional: Contractor name, total amount
- Optional: User's notes about the quote

### How to Invoke
```
Call quote analyzer with uploaded file:
- File: [reference]
- Context: [user's concerns or questions]
```

### Output Format Expectations
```
Quote Summary:
- Contractor: [name]
- Total: SGD [amount]
- Scope: [what's included]
- Missing: [common items not included]
- Warnings: [vague descriptions, unclear pricing]
- Comparison: [vs typical ranges if available]
```

### Limitations
- OCR accuracy depends on document quality
- Cannot interpret handwritten notes well
- Does not validate contractor credentials
- Not legal or contractual advice
- May miss nuanced scope items

### Examples
```
User: "I got this quote from a contractor - does it look complete?"
Advisor: "Let me analyze the quote with the quote analyzer tool..."
[Call tool]
Advisor: "The quote includes [items]. However, I notice [missing items]. Typical quotes for similar projects also include..."
```

## 3. Memory Update Tool
### Purpose
Classify and store important user preferences and project decisions.

### Trigger Conditions
- User expresses durable preference
- Project-specific decision is made
- Important assumption is established
- Need to remember for future reference

### Required Inputs
- Conversation context
- Specific statement to classify
- Optional: Assistant response for context

### How to Invoke
```
Memory classification triggered automatically after each response.
Manual override available if needed.
```

### Output Format Expectations
```
Memory stored:
- Type: [long-term/short-term]
- Key/Type: [category]
- Value/Note: [content]
- Confidence: [score]
```

### Limitations
- Classification accuracy depends on context
- May miss subtle preferences
- Confidence scoring is approximate
- Requires periodic review and cleanup

## 4. File Management Tool
### Purpose
Handle uploaded files (floor plans, inspiration images, documents).

### Trigger Conditions
- User uploads a file
- User references an uploaded file
- Need to retrieve file information

### Required Inputs
- File reference or metadata
- Action (store, retrieve, list, delete)

### Output Format Expectations
```
File information:
- Type: [floor_plan, quote, inspiration, other]
- Name: [original filename]
- Size: [bytes]
- Uploaded: [timestamp]
- URL: [access link if needed]
```

## Tool Use Discipline

### Before Calling Any Tool
1. **Verify necessity**: Is this tool really needed?
2. **Check inputs**: Do I have all required information?
3. **Set expectations**: Explain to user what the tool will do
4. **Get consent**: Implicit through conversation flow

### During Tool Execution
1. **Show progress**: "Analyzing your quote..."
2. **Handle errors**: Gracefully if tool fails
3. **Interpret results**: Don't just forward raw output
4. **Contextualize**: Relate results to user's situation

### After Tool Execution
1. **Present clearly**: Use user-friendly format
2. **Explain limitations**: What the results don't include
3. **Suggest next steps**: Based on tool output
4. **Update memory**: Store relevant insights

### Tool Selection Guidelines
- **Estimator**: For budget ranges, not exact quotes
- **Quote analyzer**: For document analysis, not legal advice
- **Memory tools**: For important preferences, not trivial chat
- **File tools**: For document management, not content creation

### Safety Rules
- NEVER use tools to bypass role boundaries
- ALWAYS disclose tool usage to user
- ALWAYS explain tool limitations
- NEVER present tool output as personal expertise
- ALWAYS maintain user privacy in tool calls

## Integration Notes
Tools are called via backend API. The advisor agent never calls tools directly - it requests tool usage through the conversation context, and the backend handles the actual tool execution with proper authentication and scoping.
