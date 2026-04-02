# Memory Management

## What Durable Memories Matter
### User Preferences (Long-term)
- **Style preferences**: "Prefers minimalist design", "Loves natural materials"
- **Budget posture**: "Budget-conscious", "Willing to invest in quality"
- **Family constraints**: "Has young children", "Elderly family member"
- **Communication style**: "Prefers detailed explanations", "Wants quick answers"
- **Risk tolerance**: "Conservative", "Willing to try new things"
- **Previous experience**: "First renovation", "Has renovated before"

### Project Facts (Structured Data)
- Property type, room count, existing conditions
- Budget ranges, timeline constraints
- Uploaded files, contractor quotes
- These are stored in database, not memory system

## What Must Not Be Stored
### Privacy-Sensitive
- Exact addresses, unit numbers
- Financial details beyond budget ranges
- Personal identifiers
- Contact information

### Trivial Content
- Greetings ("Hi", "Hello")
- Simple acknowledgments ("Thanks", "OK")
- Filler conversation
- Duplicate information

### Temporary States
- Current mood (unless relevant to preferences)
- One-time frustrations
- Passing comments

## How to Summarize Project Continuity
### After Each Session
1. **Key decisions made**: "Chose white cabinets over wood"
2. **Open questions**: "Still deciding between tile and vinyl flooring"
3. **Next steps**: "Will upload floor plan next week"
4. **Budget updates**: "Revised budget to SGD 40,000"
5. **Scope changes**: "Added bathroom to renovation"

### Memory Format
```
[Date] Summary:
- Decisions: [list]
- Open items: [list]  
- Next: [actions]
- Budget: [updates]
- Scope: [changes]
```

### Classification Rules
#### Store as Long-term Memory When:
- Pattern appears across multiple conversations
- User expresses strong preference ("I always...", "I never...")
- Relevant to future projects
- Stable over time
- Not project-specific

#### Store as Short-term Memory When:
- Project-specific decision
- Temporary assumption
- Unresolved question
- Current priority
- Likely needed again soon

#### Do Not Store When:
- Already in structured data
- Trivial or filler
- One-time comment
- Greeting/acknowledgment
- Duplicate of existing memory

## Memory Retrieval
### Context Building
When starting a conversation:
1. Load user's long-term memories (last 20)
2. Load project's short-term memories (active, last 10)
3. Load recent chat history (last 10 messages)
4. Load project facts from database

### Memory Updates
After each assistant response:
1. Classify user's last message
2. Classify assistant's response if relevant
3. Store appropriate memories
4. Update confidence for existing memories

## Confidence Scoring
- **High (0.8-1.0)**: Explicit statement, repeated pattern
- **Medium (0.5-0.7)**: Implied preference, single strong statement
- **Low (0.3-0.5)**: Inferred from context, weak signal
- **Very low (<0.3)**: Speculative, don't store

## Example Memory Creation
```
User: "I really hate glossy finishes - they show every fingerprint!"
Classification: Long-term memory
Key: material_preference
Value: Prefers matte finishes over glossy due to maintenance
Confidence: 0.9
```

```
User: "For this project, I think we should prioritize the kitchen over the living room"
Classification: Short-term memory
Type: priority_assignment
Note: Kitchen takes priority over living room in current project
Confidence: 0.7
```

## Memory Maintenance
### Periodic Review
- Archive resolved short-term memories
- Reduce confidence of old memories if not reinforced
- Merge similar memories
- Remove outdated information

### User Control
- Allow users to view their memories
- Allow users to correct or delete memories
- Explain what memories are stored and why

## Ethical Considerations
- Be transparent about memory storage
- Only store what's necessary for service improvement
- Allow opt-out of memory features
- Secure storage and access controls
- Regular privacy reviews
