# 🏠 Renovation Advisor AI

**AI-powered renovation planning platform** - Get personalized guidance, realistic budgets, and organized planning for your home renovation projects.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38b2ac)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)](https://www.prisma.io)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-AI-8b5cf6)](https://openclaw.ai)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org)

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

### 📦 Database Setup (Essential)

#### Option 1: Local PostgreSQL (Recommended for Development)

**macOS (Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database and user
createdb renovation_advisor
createuser chozengone --createdb

# Verify connection
psql -d renovation_advisor -c "SELECT version();"
```

**Linux (Ubuntu/Debian):**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE renovation_advisor;"
sudo -u postgres psql -c "CREATE USER chozengone WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE renovation_advisor TO chozengone;"
```

**Windows:**
1. Download PostgreSQL from [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run installer, remember your password
3. Use pgAdmin or psql to create database:
```sql
CREATE DATABASE renovation_advisor;
```

#### Option 2: Cloud PostgreSQL (Production)

**Neon.tech (Free Tier):**
1. Sign up at [neon.tech](https://neon.tech)
2. Create new project → "renovation-advisor"
3. Copy connection string from dashboard
4. Use in your `.env.local`

**Supabase (Free Tier):**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy and use in `.env.local`

**Vercel Postgres:**
1. In Vercel dashboard, go to Storage → Postgres
2. Create new database
3. Copy connection string for use in deployment

### 🛠️ One-Command Setup
```bash
# 1. Clone and install dependencies
git clone https://github.com/redlobsters1990-lab/Reno.git
cd Reno
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Edit .env.local with your database connection
# For local PostgreSQL:
DATABASE_URL="postgresql://chozengone@localhost:5432/renovation_advisor"

# For Neon.tech:
DATABASE_URL="postgresql://neondb_owner:password@ep-cool-breeze-123456.us-east-2.aws.neon.tech/renovation_advisor?sslmode=require"

# 4. Generate authentication secret
openssl rand -base64 32
# Copy output to NEXTAUTH_SECRET in .env.local

# 5. Initialize database
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Create and run migrations
npx prisma db seed           # Load test data

# 6. Start development server
npm run dev
```

### 📝 Environment Variables (.env.local)
```env
# ========== DATABASE ==========
# Local PostgreSQL
DATABASE_URL="postgresql://chozengone@localhost:5432/renovation_advisor"

# Neon.tech (example)
# DATABASE_URL="postgresql://neondb_owner:password@ep-cool-breeze-123456.us-east-2.aws.neon.tech/renovation_advisor?sslmode=require"

# ========== AUTHENTICATION ==========
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ========== OPENCLAW AI ==========
# Optional: For full AI integration
OPENCLAW_BASE_URL="http://localhost:18789"
OPENCLAW_API_KEY="your-api-key"

# ========== FILE STORAGE ==========
FILE_STORAGE_ROOT="./uploads"

# ========== APPLICATION ==========
APP_URL="http://localhost:3000"
```

### 🎮 Test Drive
After setup, visit `http://localhost:3000` and use:
- **Email**: `test@example.com`
- **Password**: `password123`

Or create your own account via signup page.

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
│   ├── constants.ts      # App constants
│   ├── email-utils.ts    # Email normalization
│   ├── logger.ts         # Application logging
│   ├── rate-limit.ts     # Rate limiting
│   └── validation.ts     # Form validation
├── server/                # Backend services
│   ├── services/         # Business logic
│   │   ├── project.ts    # Project management
│   │   ├── memory.ts     # Memory classification
│   │   ├── estimate.ts   # Cost estimation
│   │   ├── quote.ts      # Quote analysis
│   │   ├── upload.ts     # File handling
│   │   └── openclaw.ts   # AI integration
│   ├── db.ts             # Database client
│   ├── auth.ts           # Authentication
│   ├── verification.ts   # Email verification
│   └── reset.ts          # Password reset
├── prisma/               # Database layer
│   ├── schema.prisma     # Database schema (17 models)
│   ├── migrations/       # Migration files
│   └── seed.ts          # Test data
├── openclaw/             # AI Agent Workspace
│   ├── advisor/          # Main renovation advisor
│   ├── estimator/        # Cost estimation specialist
│   ├── quote-analyzer/   # Quote comparison expert
│   └── matcher/          # Contractor matching
├── uploads/              # File storage
├── middleware.ts         # Authentication middleware
├── middleware.security.ts # Security middleware
└── public/               # Static assets
```

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code quality check |
| `npm run typecheck` | TypeScript compilation check |
| `npx prisma studio` | Open database GUI (port 5555) |
| `npx prisma migrate dev` | Create and run migrations |
| `npx prisma migrate deploy` | Run migrations in production |
| `npx prisma db seed` | Load test data |
| `npx prisma generate` | Generate Prisma Client |

## 🗄️ Database Schema Overview

The platform uses a **user-centric relational database** with 17 models:

### Core Models:
- **User** - User accounts with authentication
- **Project** - Renovation projects (belongs to User)
- **Conversation** - Chat conversations (belongs to User)
- **ChatMessage** - Individual chat messages
- **UploadedFile** - User-uploaded files
- **CostEstimate** - AI-generated cost estimates
- **ContractorQuote** - Contractor quotes with line items
- **Job** - Async processing jobs tracking
- **UserActivity** - Audit log for user actions
- **CostEvent** - Usage/cost tracking

### Authentication (NextAuth):
- **Account** - OAuth accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

### Memory System:
- **UserLongTermMemory** - Long-term user preferences
- **ProjectShortTermMemory** - Project-specific context

### Session Management:
- **ProjectSession** - OpenClaw session tracking

### Key Features:
- ✅ **Complete user ownership** - Every record traceable to user
- ✅ **Audit trail** - Full activity logging
- ✅ **Cost attribution** - Track usage per user
- ✅ **Scalable design** - Ready for admin dashboards

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
3. Add environment variables:
   - `DATABASE_URL` (Neon, Supabase, or Vercel Postgres)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Run production migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Deploy with one click

### Self-Hosted (Docker)
```bash
# 1. Build the application
npm run build

# 2. Set up production environment
cp .env.example .env.production
# Edit .env.production with production values

# 3. Run production migrations
npx prisma migrate deploy

# 4. Start the server
npm start

# 5. (Optional) Use PM2 for process management
npm install -g pm2
pm2 start npm --name "renovation-advisor" -- start
pm2 save
pm2 startup
```

### Docker (Coming Soon)
```dockerfile
# Dockerfile will be added in next release
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/auth/forgot` - Request password reset
- `POST /api/auth/reset` - Reset password
- `GET /api/auth/verify` - Verify email

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

## 🛡️ Security Features

### Authentication & Authorization
- **Secure Sessions**: NextAuth with HTTP-only cookies
- **Password Security**: bcrypt hashing with complexity requirements
- **Email Verification**: Required for account activation
- **Password Reset**: Secure token-based reset flow
- **Rate Limiting**: 10 login attempts/15min, 3 reset requests/hour
- **Ownership Checks**: All operations verify user ownership

### Data Protection
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: NextAuth built-in CSRF protection
- **File Security**: Path traversal protection, owner verification
- **Environment Security**: Safe parsing with clear error messages

### Audit & Monitoring
- **Activity Logging**: All user actions logged with context
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Query optimization and indexing

## 🔍 Troubleshooting

### Common Issues:

**1. Database Connection Failed**
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Test connection
psql "postgresql://chozengone@localhost:5432/renovation_advisor" -c "SELECT 1;"

# Create database if missing
createdb renovation_advisor
```

**2. Authentication Errors**
```bash
# Generate new NEXTAUTH_SECRET
openssl rand -base64 32
# Update .env.local and restart server
```

**3. Prisma Migration Issues**
```bash
# Reset and regenerate
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

**4. Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Getting Help:
1. Check the [OpenClaw Discord](https://discord.com/invite/clawd)
2. Open an issue on [GitHub](https://github.com/redlobsters1990-lab/Reno/issues)
3. Review the [OpenClaw documentation](https://docs.openclaw.ai)

## 📈 Roadmap

### Phase 1: MVP (Current) ✅
✅ Complete feature implementation  
✅ Production-ready architecture  
✅ AI integration foundation  
✅ Comprehensive documentation  
✅ Security hardening  
✅ Database redesign for user-centric ownership  

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

## 🧪 Testing

### Manual Testing
1. **Authentication Flow**: Sign up → Verify email → Login → Logout
2. **Project Creation**: Create project → Add details → View dashboard
3. **AI Chat**: Send messages → View responses → Check memory
4. **Cost Estimation**: Generate estimates → View breakdowns
5. **File Upload**: Upload files → View in project → Download
6. **Quote Management**: Upload quotes → Compare → Update status

### Automated Tests (Coming Soon)
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines:
- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Write comprehensive documentation
- Add tests for new features
- Update Prisma schema with migrations

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- AI powered by [OpenClaw](https://openclaw.ai)
- Database with [Prisma](https://prisma.io) & [PostgreSQL](https://postgresql.org)
- Icons by [Lucide](https://lucide.dev)
- Design inspiration from modern SaaS platforms
- Security best practices from OWASP guidelines

---

## 📊 Database Statistics

The current database includes:
- **17 models** with clear ownership relationships
- **Complete audit trail** for all user actions
- **Cost attribution** for usage tracking
- **Scalable design** for admin dashboards
- **Production-ready** with proper indexes and constraints

### Quick Database Commands:
```bash
# View database schema
npx prisma studio

# Create migration
npx prisma migrate dev --name add_feature

# Reset database (development)
npx prisma migrate reset

# Seed with test data
npx prisma db seed

# Generate Prisma Client
npx prisma generate
```

### Database Health Check:
```sql
-- Check table sizes
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size('"' || table_name || '"')) as size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size('"' || table_name || '"') DESC;

-- Check user activity
SELECT 
    u.email,
    COUNT(p.id) as project_count,
    COUNT(cm.id) as message_count,
    MAX(ua.created_at) as last_active
FROM "User" u
LEFT JOIN "Project" p ON u.id = p."userId"
LEFT JOIN "ChatMessage" cm ON u.id = cm."userId"
LEFT JOIN "UserActivity" ua ON u.id = ua."userId"
GROUP BY u.id, u.email
ORDER BY last_active DESC;
```

---

**Happy Renovating!** 🛠️✨

For support, join our [OpenClaw Discord](https://discord.com/invite/clawd) or open an issue on GitHub.