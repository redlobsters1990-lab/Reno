#!/bin/bash

echo "🔧 Fixing and starting Renovation Advisor AI..."

# Navigate to project
cd /Users/chozengone/.openclaw/workspace

echo "1. Stopping any running processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

echo "2. Setting up environment..."
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://localhost:5432/renovation_advisor"
NEXTAUTH_SECRET=this-is-a-32-character-secret-for-testing-only-123
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
EOF

echo "3. Ensuring PostgreSQL is running..."
brew services start postgresql 2>/dev/null || true

echo "4. Creating database if needed..."
createdb renovation_advisor 2>/dev/null || true

echo "5. Clearing caches..."
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/.cache

echo "6. Generating Prisma client..."
npx prisma generate

echo "7. Pushing database schema..."
npx prisma db push

echo "8. Seeding database..."
npx tsx prisma/seed.ts

echo "9. Starting development server..."
echo "🚀 Server starting at http://localhost:3000"
echo "📋 Test credentials: test@example.com / password123"
echo ""

npm run dev