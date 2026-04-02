# 🏠 Renovation Advisor AI

**AI-powered renovation planning platform** - Get personalized guidance, realistic budgets, and organized planning for your home renovation projects.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38b2ac)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)](https://www.prisma.io)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-AI-8b5cf6)](https://openclaw.ai)

## ✨ Features

### 🎯 Core Platform
1. **AI Renovation Advisor** - Chat with an expert AI for personalized guidance
2. **Rule-Based Cost Estimator** - Get realistic budget ranges with confidence scoring
3. **Quote Analysis** - Upload and compare contractor quotes side-by-side
4. **Memory System** - Automatic classification of preferences, decisions, and assumptions
5. **File Management** - Store floor plans, inspiration images, and documents

### 🛠️ Technical Excellence
6. **Modern Stack** - Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL
7. **Secure Authentication** - NextAuth with credentials provider
8. **Production-Ready** - Complete with error handling, loading states, and validation
9. **OpenClaw Integration** - 4 specialized AI agents with complete configurations
10. **Scalable Architecture** - Modular services, proper ownership checks, cloud-ready

### 🎨 User Experience
11. **Beautiful UI** - Modern design with smooth animations and responsive layout
12. **Intuitive Workflow** - From project creation to contractor selection
13. **Real-time Updates** - Live chat, file uploads, and status tracking
14. **Comprehensive Dashboard** - Project overview, statistics, and quick actions

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm**
- **PostgreSQL** database (local or cloud)
- (Optional) **OpenClaw** for full AI integration

### One-Command Setup
```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your database and settings

# 3. Initialize database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 4. Start development
npm run dev
```

### Environment Variables (.env.local)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/renovation_advisor"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenClaw AI Integration
OPENCLAW_BASE_URL="http://localhost:18789"  # When OpenClaw is available
OPENCLAW_API_KEY="your-api-key"

# File Storage
FILE_STORAGE_ROOT="./uploads"

# Application
APP_URL="http://localhost:3000"
```

### 🎮 Test Drive
After setup, visit `http://localhost:3000` and use:
- **Email**: `test@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
renovation-advisor-ai/
├── app/                    # Next.js 15 App Router
│   ├── api/               # REST API endpoints
│   ├── auth/              # Authentication flows
│   ├── dashboard/         # User workspace
│   └── [id]/              # Dynamic project pages
├── components/            # Reusable UI components
│   ├── home-page.tsx      # Landing page
│   ├── estimate-display.tsx # Cost estimate visualization
│   ├── memory-summary.tsx # Memory system UI
│   └── quote-manager.tsx  # Quote management
├── lib/                   # Utilities & configuration
│   ├── env.ts            # Environment validation
│   ├── schemas.ts        # Zod validation schemas
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
├── server/                # Backend services
│   ├── services/         # Business logic
│   │   ├── project.ts    # Project management
│   │   ├── memory.ts     # Memory classification
│   │   ├── estimate.ts   # Cost estimation
│   │   ├── quote.ts      # Quote analysis
│   │   ├── upload.ts     # File handling
│   │   └── openclaw.ts   # AI integration
│   ├── db.ts             # Database client
│   └── auth.ts           # Authentication
├── prisma/               # Database layer
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Migration files
│   └── seed.ts          # Test data
├── openclaw/             # AI Agent Workspace
│   ├── advisor/          # Main renovation advisor
│   ├── estimator/        # Cost estimation specialist
│   ├── quote-analyzer/   # Quote comparison expert
│   └── matcher/          # Contractor matching
├── uploads/              # File storage
├── middleware.ts         # Authentication middleware
└── public/               # Static assets
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code quality check |
| `npm run typecheck` | TypeScript compilation check |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Create and run migrations |
| `npx prisma db seed` | Load test data |

## 🤖 OpenClaw AI Integration

The platform includes a complete **OpenClaw workspace** with 4 specialized agents:

### 🎓 **Advisor Agent** (`/openclaw/advisor/`)
- **Role**: Main renovation guidance and planning
- **Skills**: Design consultation, project planning, decision support
- **Memory**: Long-term user preferences, project context

### 💰 **Estimator Agent** (`/openclaw/estimator/`)
- **Role**: Cost estimation and budget planning
- **Skills**: Rule-based calculations, market rate analysis
- **Output**: Three-tier estimates (lean/realistic/stretch)

### 📊 **Quote-Analyzer Agent** (`/openclaw/quote-analyzer/`)
- **Role**: Contractor quote comparison and analysis
- **Skills**: Price breakdown, scope comparison, missing items
- **Output**: Side-by-side comparisons and recommendations

### 🤝 **Matcher Agent** (`/openclaw/matcher/`)
- **Role**: Future contractor matching (coming soon)
- **Skills**: Requirement analysis, contractor vetting
- **Goal**: Connect users with qualified professionals

Each agent includes:
- `agent.md` - Personality and capabilities
- `soul.md` - Core identity and values  
- `user.md` - User context understanding
- `memory.md` - Memory management strategy
- `heartbeat.md` - Periodic tasks and checks
- `tools.md` - Available tools and skills
- `skills/` - Specialized skill implementations

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Connect PostgreSQL (Vercel Postgres, Neon, Supabase)
5. Deploy with one click

### Self-Hosted
```bash
# 1. Build the application
npm run build

# 2. Set up production environment
# Edit .env.production with your settings

# 3. Run production migrations
npx prisma migrate deploy

# 4. Start the server
npm start

# 5. (Optional) Use PM2 for process management
npm install -g pm2
pm2 start npm --name "renovation-advisor" -- start
```

### Docker (Coming Soon)
```dockerfile
# Dockerfile will be added in next release
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- All protected routes require authentication via middleware

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Archive project

### AI Chat
- `POST /api/chat` - Send message to AI advisor
- `GET /api/chat/[projectId]` - Get chat history

### Cost Estimation
- `POST /api/estimates` - Generate cost estimate
- `GET /api/estimates/[projectId]` - Get project estimates

### Quote Management
- `POST /api/quotes` - Upload contractor quote
- `GET /api/quotes/[projectId]` - List project quotes
- `PUT /api/quotes/[id]` - Update quote status
- `DELETE /api/quotes/[id]` - Remove quote

### File Uploads
- `POST /api/uploads` - Upload file
- `GET /api/uploads/[projectId]` - List project files
- `GET /api/files/[fileId]` - Serve uploaded file

## 🛡️ Security

- **Authentication**: NextAuth with secure session management
- **Authorization**: User ownership checks on all operations
- **Validation**: Zod schemas for all API inputs
- **File Security**: Path traversal protection, owner verification
- **Environment**: Safe parsing with clear error messages
- **Database**: Prepared statements via Prisma

## 📈 Roadmap

### Phase 1: MVP (Current)
✅ Complete feature implementation
✅ Production-ready architecture
✅ AI integration foundation
✅ Comprehensive documentation

### Phase 2: Enhanced AI
🔲 Real OpenClaw gateway integration
🔲 Advanced quote parsing (OCR)
🔲 Contractor matching algorithm
🔲 Predictive timeline estimation

### Phase 3: Platform Growth
🔲 Mobile app (React Native)
🔲 Contractor portal
🔲 Marketplace integration
🔲 Advanced analytics

### Phase 4: Enterprise
🔲 Team collaboration
🔲 API for partners
🔲 White-label solutions
🔲 International expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- AI powered by [OpenClaw](https://openclaw.ai)
- Icons by [Lucide](https://lucide.dev)
- Design inspiration from modern SaaS platforms
