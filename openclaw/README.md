# 🤖 OpenClaw Workspace - Renovation Advisor AI

Complete AI agent configurations for the Renovation Advisor AI platform. This workspace contains 4 specialized agents that work together to provide comprehensive renovation planning assistance.

## 🎯 Agent Overview

| Agent | Role | Key Skills | Status |
|-------|------|------------|--------|
| **Advisor** | Main renovation guidance | Conversation, memory management, coordination | ✅ Complete |
| **Estimator** | Cost estimation | Rule-based calculations, market analysis | ✅ Complete |
| **Quote Analyzer** | Quote processing | Document parsing, comparison, normalization | ⚠️ Basic (needs OCR) |
| **Matcher** | Contractor matching | Requirement analysis, vetting, recommendations | 🔄 Future |

## 📁 Directory Structure

```
openclaw/
├── README.md                    # This file
├── advisor/                     # Main advisor agent
│   ├── agent.md                # Agent personality & capabilities
│   ├── soul.md                 # Core identity & values
│   ├── user.md                 # User context understanding
│   ├── memory.md               # Memory management strategy
│   ├── heartbeat.md            # Periodic tasks & checks
│   ├── tools.md                # Available tools & skills
│   └── skills/                 # Specialized capabilities
│       ├── renovation-intake/  # Project brief extraction
│       ├── cost-estimation/    # Budget calculation
│       ├── quote-analysis/     # Quote processing
│       └── memory-management/  # Memory classification
├── estimator/                   # Cost estimation specialist
│   ├── agent.md
│   ├── soul.md
│   ├── user.md
│   ├── memory.md
│   ├── heartbeat.md
│   ├── tools.md
│   └── skills/
│       └── cost-estimation/    # Rule-based calculations
├── quote-analyzer/              # Quote analysis expert
│   └── agent.md                # Basic configuration
└── matcher/                     # Contractor matching
    └── agent.md                # Basic configuration
```

## 🔄 Agent Workflow

```
User Conversation → Advisor Agent
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
  Needs Estimation?         Has Quotes?
        ↓                       ↓
  Estimator Agent        Quote Analyzer
        ↓                       ↓
  Return Estimate        Return Analysis
        └───────────┬───────────┘
                    ↓
            Update Memory
                    ↓
      Personalized Future Advice
```

## 🛠️ Agent Details

### 🎓 **Advisor Agent** (`advisor/`)
**Primary Role**: Main conversation handler and project coordinator

**Key Responsibilities**:
- Engage users in natural conversations about renovation plans
- Extract structured project requirements from free-form discussions
- Coordinate with other agents (estimator, quote analyzer) as needed
- Manage user memory (preferences, decisions, assumptions)
- Provide personalized recommendations based on project context

**Memory Strategy**:
- **Long-term**: User preferences, design tastes, budget posture
- **Short-term**: Project-specific decisions, temporary constraints
- **Trivial**: Casual remarks, greetings, generic questions

**Skills**:
1. **Renovation Intake** - Extract structured briefs from conversations
2. **Cost Estimation** - Trigger estimator agent for budget planning
3. **Quote Analysis** - Analyze uploaded contractor quotes
4. **Memory Management** - Classify and store important information

### 💰 **Estimator Agent** (`estimator/`)
**Primary Role**: Rule-based cost estimation specialist

**Key Responsibilities**:
- Calculate realistic budget ranges using deterministic logic
- Apply property type multipliers (HDB, Condo, Landed)
- Adjust for style tiers (Basic, Standard, Premium)
- Provide confidence scores based on input completeness
- Generate three-tier estimates (Lean, Realistic, Stretch)

**Estimation Logic**:
```javascript
// Example calculation for kitchen renovation
baseCost = roomRules.kitchen.baseCost
propertyMultiplier = propertyTypeMultipliers[propertyType]
styleMultiplier = styleTierMultipliers[styleTier]
estimate = baseCost * propertyMultiplier * styleMultiplier
```

**Output Format**:
- **Lean Range**: Basic scope, standard materials, minimal contingencies
- **Realistic Range**: Good quality, reasonable contingencies, typical market rates
- **Stretch Range**: Premium materials, generous contingencies, higher-end finishes

### 📊 **Quote Analyzer Agent** (`quote-analyzer/`)
**Primary Role**: Contractor quote processing and comparison

**Key Responsibilities**:
- Parse uploaded quote documents (PDF, images, documents)
- Extract key information (contractor, total, line items)
- Normalize data for comparison across quotes
- Identify missing scope items
- Flag potential red flags or inconsistencies

**Future Enhancements**:
- OCR integration for scanned documents
- AI-powered line item categorization
- Automated scope comparison
- Price benchmarking against market rates

### 🤝 **Matcher Agent** (`matcher/`)
**Primary Role**: Contractor matching and recommendations

**Future Responsibilities**:
- Analyze project requirements and constraints
- Match with qualified contractors in database
- Consider location, specialty, availability, ratings
- Provide ranked recommendations with rationale
- Facilitate introduction and communication

## 🔌 Integration with Web Platform

The web application communicates with OpenClaw agents through the `OpenClawClient` service (`server/services/openclaw.ts`).

### Session Management
Each user-project combination gets a unique session key:
```typescript
sessionKey = `${userId}:${projectId}`
```
This ensures conversation continuity and proper memory isolation.

### API Flow
```typescript
// 1. User sends message
const response = await openClawClient.sendMessage({
  sessionKey: `${userId}:${projectId}`,
  message: userMessage,
  agent: 'advisor'
});

// 2. Advisor processes message
// 3. If estimation needed, calls estimator agent
// 4. Returns combined response
```

### Environment Configuration
```env
OPENCLAW_BASE_URL=http://localhost:18789
OPENCLAW_API_KEY=your-api-key-here
```

## 🧪 Testing & Development

### Local Testing
```bash
# Start OpenClaw gateway
openclaw gateway start

# Test advisor with sample conversation
openclaw agent run --workspace ./openclaw/advisor \
  --message "Hi! I'm planning to renovate my 4-room HDB flat. I want to focus on the kitchen and bathroom first."

# Test estimator directly
openclaw agent run --workspace ./openclaw/estimator \
  --message "Estimate cost for kitchen renovation in HDB, standard quality, 100 sqft"
```

### Integration Testing
```bash
# Test the full flow via API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test-project", "message": "How much for kitchen renovation?"}'
```

## 🚀 Production Deployment

### Requirements
1. **OpenClaw Gateway** running and accessible
2. **API Key** configured for authentication
3. **Session Storage** configured (Redis recommended for production)
4. **Monitoring** for agent performance and errors

### Configuration
```env
# Production environment variables
OPENCLAW_BASE_URL=https://your-openclaw-gateway.com
OPENCLAW_API_KEY=prod-api-key-here
OPENCLAW_SESSION_STORE=redis://redis-host:6379
```

### Scaling Considerations
- **Session Isolation**: Each user-project session is independent
- **Agent Pooling**: Multiple instances of each agent for load balancing
- **Memory Management**: Regular cleanup of stale sessions
- **Error Handling**: Graceful degradation when agents are unavailable

## 📈 Performance Metrics

Track these key metrics:
- **Response Time**: Average agent response time
- **Session Duration**: How long users engage with agents
- **Estimation Accuracy**: Comparison of estimates vs actual quotes
- **User Satisfaction**: Feedback and completion rates
- **Memory Hit Rate**: How often stored memories influence responses

## 🔧 Troubleshooting

### Common Issues

1. **Agent Not Responding**
   - Check OpenClaw gateway status
   - Verify API key and base URL
   - Check agent workspace configuration

2. **Memory Not Persisting**
   - Verify session key format
   - Check memory classification rules
   - Ensure proper storage configuration

3. **Estimation Errors**
   - Validate input parameters
   - Check rule table configurations
   - Verify property type and style tier mappings

### Logging
Enable detailed logging for debugging:
```typescript
// In openclaw.ts
const client = new OpenClawClient({
  baseUrl: process.env.OPENCLAW_BASE_URL,
  apiKey: process.env.OPENCLAW_API_KEY,
  debug: process.env.NODE_ENV === 'development'
});
```

## 🔮 Future Enhancements

### Phase 2 (Next Release)
- **Real-time Collaboration**: Multiple users per project
- **Advanced OCR**: Better quote document parsing
- **Contractor Database**: Integrated contractor profiles
- **Timeline Estimation**: Project duration predictions

### Phase 3 (Platform Growth)
- **Mobile Integration**: Dedicated mobile app
- **Marketplace**: Direct contractor booking
- **Advanced Analytics**: ROI calculations, trend analysis
- **International Support**: Multiple regions and currencies

## 📚 Additional Resources

- [OpenClaw Documentation](https://docs.openclaw.ai)
- [Agent Skills Development](https://docs.openclaw.ai/guides/skills)
- [API Reference](https://docs.openclaw.ai/api)
- [Community Discord](https://discord.gg/clawd)

## 📄 License

This workspace is part of the Renovation Advisor AI platform. See main project LICENSE for details.
