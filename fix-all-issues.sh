#!/bin/bash

echo "🚀 Fixing All Issues..."

# Navigate to correct directory
cd /Users/chozengone/.openclaw/workspace
echo "✅ Working in: $(pwd)"

# 1. Fix DATABASE_URL with correct username
echo "🔧 1. Fixing DATABASE_URL..."
MY_USERNAME=$(whoami)
cat > .env.local << EOF
DATABASE_URL="postgresql://${MY_USERNAME}@localhost:5432/renovation_advisor"
NEXTAUTH_SECRET=this-is-a-32-character-secret-for-testing-only-123
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
FILE_STORAGE_ROOT="./uploads"
EOF
echo "✅ DATABASE_URL updated with username: ${MY_USERNAME}"

# 2. Stop any running servers
echo "🔧 2. Stopping any running servers..."
pkill -f "next" 2>/dev/null || true
echo "✅ Servers stopped"

# 3. Clear cache
echo "🔧 3. Clearing cache..."
rm -rf .next
echo "✅ Cache cleared"

# 4. Generate Prisma client
echo "🔧 4. Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma
echo "✅ Prisma client generated"

# 5. Push database schema
echo "🔧 5. Pushing database schema..."
npx prisma db push --schema=./prisma/schema.prisma
echo "✅ Database schema pushed"

# 6. Seed database
echo "🔧 6. Seeding database..."
npx prisma db seed --schema=./prisma/schema.prisma
echo "✅ Database seeded"

# 7. Start server
echo "🚀 7. Starting development server..."
echo "📢 Server will start on: http://localhost:3000"
echo "📢 Test credentials: test@example.com / password123"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev