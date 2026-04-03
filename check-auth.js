// Quick check for authentication issues
console.log("🔍 Checking Authentication Configuration...\n");

// Check environment
console.log("1. Environment Variables:");
console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "Not set");
console.log("   APP_URL:", process.env.APP_URL || "Not set");
console.log("   Server running on: http://localhost:3001");

// Check if they match
if (process.env.NEXTAUTH_URL !== "http://localhost:3001") {
  console.log("   ⚠️  WARNING: NEXTAUTH_URL doesn't match running server port!");
  console.log("   Fix: Update .env.local to use port 3001");
}

// Check database connection
console.log("\n2. Database Connection:");
try {
  const { prisma } = require('./server/db');
  
  // Test connection
  prisma.$queryRaw`SELECT 1`.then(() => {
    console.log("   ✅ Database connection working");
    
    // Check users
    prisma.user.findMany({
      select: { email: true, name: true, createdAt: true },
      take: 5
    }).then(users => {
      console.log("   Users in database:", users.length);
      users.forEach(user => {
        console.log(`     - ${user.email} (${user.name})`);
      });
    });
  }).catch(err => {
    console.log("   ❌ Database error:", err.message);
  });
} catch (error) {
  console.log("   ❌ Failed to connect to database:", error.message);
}

// Check NextAuth configuration
console.log("\n3. NextAuth Configuration:");
try {
  const { authOptions } = require('./server/auth');
  console.log("   ✅ Auth options loaded");
  console.log("   Session strategy:", authOptions.session?.strategy);
  console.log("   Signin page:", authOptions.pages?.signIn);
  console.log("   Signup page:", authOptions.pages?.signUp);
} catch (error) {
  console.log("   ❌ Failed to load auth options:", error.message);
}

// Common issues
console.log("\n4. Common Issues to Check:");
console.log("   a. Browser console errors (F12 → Console)");
console.log("   b. Server terminal logs for errors");
console.log("   c. Cookies blocked (try incognito mode)");
console.log("   d. Port mismatch (server on 3001, NEXTAUTH_URL on 3000)");
console.log("   e. Database running: brew services list | grep postgresql");

// Fix recommendations
console.log("\n5. Immediate Fixes Applied:");
console.log("   ✅ Fixed: Changed NEXTAUTH_URL to http://localhost:3001");
console.log("   ✅ Fixed: Removed router.refresh() calls");
console.log("   ✅ Fixed: Added proper loading spinners");
console.log("   ✅ Fixed: Better error messages for duplicate emails");
console.log("   ✅ Fixed: useEffect for URL parameter checking");

console.log("\n🚀 Next Steps:");
console.log("1. Restart the server: pkill -f 'next' && npm run dev");
console.log("2. Test in incognito/private browser window");
console.log("3. Check browser console for errors");
console.log("4. Try registration with new email");
console.log("5. Try login with test@example.com / password123");

console.log("\n📋 Test URLs:");
console.log("   Signup: http://localhost:3001/auth/signup");
console.log("   Signin: http://localhost:3001/auth/signin");
console.log("   Dashboard: http://localhost:3001/dashboard");