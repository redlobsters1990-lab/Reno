# Memory Management Skill

## Purpose
Intelligently classify, store, and retrieve user preferences and project decisions. Create continuity across conversations while respecting privacy and avoiding clutter. Turn casual conversations into structured knowledge that improves future interactions.

## Trigger Conditions
### Automatic Triggers
- After each user message and assistant response
- When user expresses strong preferences or decisions
- When project assumptions or constraints are established
- When patterns emerge across multiple conversations

### Manual Triggers
- Advisor explicitly identifies important information
- User asks to remember something specific
- System detects knowledge gap that memory could fill
- Periodic memory maintenance and cleanup

## Required Inputs
### Primary Inputs
1. **Conversation Context**: Recent messages and overall discussion
2. **User Statement**: The specific content to classify
3. **Assistant Response**: Relevant response context (if any)
4. **Project Information**: Current project details and scope

### Classification Inputs
- **Message Type**: Question, statement, preference, decision, etc.
- **Emotional Weight**: Strong vs casual expression
- **Specificity**: Concrete vs vague statement
- **Repetition**: First mention vs repeated pattern
- **Relevance**: Project-specific vs general preference

## How to Invoke
### Automatic Classification Flow
```
1. User sends message
2. Conversation continues
3. Assistant responds
4. Memory classifier analyzes:
   - User's last message
   - Assistant's response
   - Conversation context
5. Classification decision:
   - Long-term memory (user preference)
   - Short-term memory (project decision)
   - Trivial (ignore)
6. Store if appropriate
```

### Manual Classification
```
Advisor identifies important information:
"Let me make a note of that preference for future reference."
[System stores as memory with advisor annotation]
```

### Memory Retrieval Flow
```
1. User starts conversation
2. System loads:
   - User's long-term memories (last 20)
   - Project's short-term memories (active, last 10)
   - Recent chat history (last 10 messages)
3. Memories are included in conversation context
4. Advisor references memories when relevant
```

## Output Format Expectations
### Memory Storage Format
```
Long-term Memory:
- User ID: [id]
- Memory Key: [category]
- Memory Value: [content]
- Confidence: [0.0-1.0]
- Source: [chat_classifier|advisor_manual|user_request]
- Updated: [timestamp]

Short-term Memory:
- User ID: [id]
- Project ID: [id]
- Memory Type: [category]
- Note: [content]
- Status: [active|resolved|dismissed]
- Created: [timestamp]
```

### Memory Presentation in Context
```
## User Memories

Long-term Preferences:
- Style: Prefers minimalist design with natural materials
- Budget: Value-conscious but willing to invest in quality
- Family: Has young children, needs durable materials
- Communication: Prefers detailed explanations with examples

Active Project Memories:
- Decision: Chose white cabinets over wood (2024-03-15)
- Assumption: Assuming existing electrical is adequate
- Open Question: Still deciding between tile and vinyl flooring
- Priority: Kitchen takes precedence over living room
```

### Memory Reference in Conversation
```
Advisor: "I remember you mentioned preferring matte finishes..."
Advisor: "Based on our previous discussion about budget..."
Advisor: "You decided on white cabinets last week..."
Advisor: "We still need to resolve the flooring question..."
```

## Classification Rules
### Long-term Memory Candidates
**Store when:**
- User expresses durable preference ("I always...", "I never...")
- Pattern appears across multiple conversations
- Relevant to future projects beyond current one
- Stable characteristic (style, budget posture, constraints)
- Strong emotional attachment to preference

**Examples:**
- "I hate glossy surfaces - they show fingerprints!"
- "We're very budget-conscious for this project"
- "Safety is our top priority with young kids"
- "I prefer modern over traditional styles"

### Short-term Memory Candidates
**Store when:**
- Project-specific decision or assumption
- Temporary constraint or condition
- Unresolved question or pending decision
- Current priority or focus area
- Likely needed again in near future

**Examples:**
- "Let's go with the quartz countertops"
- "We're assuming the existing layout stays"
- "Need to check if we need permits"
- "Living room is lower priority than bedrooms"

### Do Not Store
**Ignore when:**
- Greetings or acknowledgments
- Simple yes/no answers without context
- Filler conversation
- Already stored in structured data
- Privacy-sensitive information
- One-time comments without significance

**Examples:**
- "Hi", "Hello", "Thanks", "OK"
- "Yes, that sounds good"
- "I'm not sure"
- Exact addresses, financial details

## Confidence Scoring
### High Confidence (0.8-1.0)
- Explicit, direct statement
- Repeated multiple times
- Strong emotional expression
- Clear, unambiguous language

### Medium Confidence (0.5-0.7)
- Implied preference
- Single strong statement
- Moderately clear language
- Some context dependence

### Low Confidence (0.3-0.5)
- Inferred from context
- Weak or casual expression
- Vague language
- Contradictory signals

### Very Low Confidence (<0.3)
- Speculative inference
- Weak signal
- Don't store

## Examples
### Example 1: Style Preference
```
User: "I really love Scandinavian design - clean lines, light wood, minimal clutter."
Classification: Long-term memory
Key: style_preference
Value: Prefers Scandinavian design with clean lines, light wood, minimal clutter
Confidence: 0.9
Source: chat_classifier
```

### Example 2: Project Decision
```
User: "For the kitchen backsplash, let's go with white subway tiles."
Advisor: "White subway tiles it is! Classic and timeless."
Classification: Short-term memory
Type: material_selection
Note: Chose white subway tiles for kitchen backsplash
Status: active
Confidence: 0.8
```

### Example 3: Budget Constraint
```
User: "Our absolute max budget is SGD 50,000 - we can't go over that."
Classification: Long-term memory (for this project)
Key: budget_constraint
Value: Absolute maximum budget of SGD 50,000 for current project
Confidence: 0.95
Note: Project-specific but important constraint
```

### Example 4: Family Consideration
```
User: "We have a toddler, so everything needs to be child-safe."
Advisor: "Important consideration! I'll keep child safety in mind."
Classification: Long-term memory
Key: family_constraint
Value: Has toddler, requires child-safe materials and designs
Confidence: 0.85
```

## Memory Maintenance
### Periodic Review
- **Daily**: Check for duplicate or conflicting memories
- **Weekly**: Archive resolved short-term memories
- **Monthly**: Reduce confidence of old unused memories
- **Quarterly**: Full memory cleanup and optimization

### User Control Features
- View all stored memories
- Edit or correct memories
- Delete unwanted memories
- Export memories for backup
- Opt-out of memory features

### Privacy Protection
- Never store exact addresses or identifiers
- Anonymize sensitive information
- Encrypt stored memories
- Regular privacy audits
- Clear data retention policies

## Best Practices
### Storage Guidelines
- **Be selective**: Better to store less than store clutter
- **Be accurate**: Verify classification before storing
- **Be relevant**: Only store what improves future interactions
- **Be transparent**: Users should know what's being stored
- **Be secure**: Protect stored information

### Retrieval Guidelines
- **Contextual**: Only retrieve relevant memories
- **Timely**: Present memories when helpful, not intrusive
- **Accurate**: Verify memory still applies before referencing
- **Discreet**: Reference naturally in conversation
- **Helpful**: Use memories to improve assistance

### User Experience
- **Empowering**: Memories should make users feel understood
- **Transparent**: Explain why something was remembered
- **Controllable**: Users should manage their memories
- **Useful**: Memories should actually improve conversations
- **Respectful**: Don't reference sensitive memories unnecessarily

## Integration with Other Skills
### Renovation Intake
- Use memories to pre-fill project briefs
- Reference previous preferences during intake
- Store intake decisions as memories

### Cost Estimation
- Consider budget preferences in estimates
- Reference material preferences in suggestions
- Store budget decisions as memories

### Quote Analysis
- Consider user's risk tolerance in analysis
- Reference previous contractor experiences
- Store quote evaluation patterns

## Success Metrics
- Users feel understood and remembered
- Conversations have better continuity
- Less repetition of established preferences
- Memories actually improve assistance quality
- Users trust the memory system
- Memory retrieval feels natural and helpful
- Privacy and security are maintained
- Memory maintenance keeps system clean
