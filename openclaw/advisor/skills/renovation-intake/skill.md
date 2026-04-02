# Renovation Intake Skill

## Purpose
Extract structured project briefs from vague homeowner conversations. Turn "I want to renovate my kitchen" into a clear, actionable project definition with scope, style, constraints, and priorities.

## Trigger Conditions
- User expresses renovation intent (new conversation)
- User describes a space they want to change
- User asks "where do I start?" or "what should I consider?"
- Conversation is vague and needs structure
- Multiple undefined aspects need clarification

## Required Inputs
### Minimum Viable Input
- Property type (HDB, Condo, Landed, etc.)
- Room/area to renovate
- Any style preferences mentioned
- Any budget hints

### Ideal Complete Input
- Property type and approximate size
- Specific rooms/areas with priorities
- Style preferences and inspirations
- Budget range or constraints
- Timeline considerations
- Family/lifestyle constraints
- Must-have vs nice-to-have items
- Previous renovation experience

## How to Invoke
### Automatic Trigger
The skill activates when conversation analysis detects:
- Vague renovation intent
- Missing critical information
- User asking for guidance on starting

### Manual Activation
Advisor can explicitly invoke when:
- Conversation is scattered
- Need to establish baseline
- Preparing for cost estimation

### Intake Process
1. **Acknowledge excitement**: "Great! Let's capture your vision..."
2. **Systematic questioning**: Use structured questions
3. **Clarify ambiguity**: Ask for specifics when vague
4. **Document decisions**: Note what's been decided
5. **Identify gaps**: Note what still needs deciding
6. **Summarize**: Recap the project brief

## Output Format Expectations
### Structured Project Brief
```
Project: [Title]
Property: [Type, estimated size]
Scope:
- Primary: [rooms/areas with priority]
- Secondary: [optional areas]
- Exclusions: [what's not included]

Style & Preferences:
- Overall style: [e.g., Modern Minimalist]
- Key materials: [e.g., wood, stone, glass]
- Color palette: [e.g., neutral with accents]
- Must-haves: [non-negotiable items]
- Nice-to-haves: [if budget allows]

Constraints:
- Budget: [range or limit]
- Timeline: [deadlines or flexibility]
- Family: [children, pets, elderly]
- Existing: [what's staying, what's going]

Open Questions:
- [Unresolved decisions]
- [Missing information]
- [Areas needing research]

Next Steps:
1. [Immediate action]
2. [Short-term research]
3. [Long-term planning]
```

### Conversation Integration
- Present brief naturally in conversation
- Ask for confirmation on each section
- Allow adjustments and refinements
- Update as conversation progresses

## Limitations
- Cannot assess physical site conditions
- Does not replace professional site survey
- Style preferences may evolve
- Budget may change with more information
- Scope may expand/contract during planning

## Examples
### Example 1: Kitchen Renovation
```
User: "I want to update my HDB kitchen"
Advisor: "Let's capture your kitchen vision. What style are you thinking?"
[Conversation continues...]
Advisor: "Based on our chat, here's your kitchen project brief:
- Property: 4-room HDB, kitchen approx 20 sqm
- Scope: Full kitchen renovation, keep existing layout
- Style: Modern with white cabinets, quartz countertops
- Must-haves: More storage, better lighting
- Budget: Around SGD 25,000
- Timeline: 3-4 weeks, flexible
- Open: Backsplash material, appliance brands
- Next: Get floor plan, research contractors"
```

### Example 2: Whole Home Refresh
```
User: "My condo feels dated, want to refresh everything"
Advisor: "Let's break this down room by room. Which area bothers you most?"
[Conversation continues...]
Advisor: "Your whole-home refresh brief:
- Property: 3-bedroom Condo, 100 sqm
- Priority: Living room & master bedroom first
- Style: Transitional (traditional + modern)
- Colors: Warm neutrals, blue accents
- Budget: Phase 1: SGD 40,000
- Constraints: Work around existing furniture
- Open: Paint vs wallpaper, flooring options
- Next: Create mood board, get paint samples"
```

## Best Practices
### Questioning Strategy
- Start broad, then get specific
- Use visual prompts: "Picture your ideal..."
- Offer examples when stuck
- Respect budget sensitivity
- Acknowledge tough decisions

### Documentation
- Capture decisions as they're made
- Note assumptions clearly
- Flag uncertainties for later
- Keep brief living document
- Update with new information

### User Experience
- Make process feel collaborative
- Celebrate clarity achievements
- Acknowledge complexity
- Provide structure without rigidity
- Allow for iteration and change

## Integration with Other Skills
### Cost Estimation
- Use brief as input for estimator
- Flag missing information needed for accurate estimates
- Note which assumptions affect cost

### Memory Management
- Store style preferences as long-term memory
- Store project decisions as short-term memory
- Update brief as memories are created

### Quote Analysis
- Use brief to evaluate quote completeness
- Compare quote scope to brief scope
- Identify gaps between brief and quotes

## Success Metrics
- User can articulate their project clearly
- All critical aspects are addressed
- Open questions are identified
- Next steps are clear and actionable
- User feels confident about direction
- Brief serves as useful reference document
