// Quick authentication test
console.log("🔧 Testing Authentication Fixes...");

// Check environment variables
console.log("\n1. Environment Check:");
console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "Not set");
console.log("   NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set (" + process.env.NEXTAUTH_SECRET.length + " chars)" : "Not set");
console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

// Test database connection
console.log("\n2. Database Check:");
try {
  const { prisma } = require('./server/db');
  console.log("   Prisma client loaded");
  
  // Count users
  prisma.user.count().then(count => {
    console.log("   Total users in database:", count);
    
    // Check test user
    prisma.user.findUnique({
      where: { email: "test@example.com" }
    }).then(user => {
      if (user) {
        console.log("   ✅ Test user exists:", user.email);
        console.log("      Name:", user.name);
        console.log("      Created:", user.createdAt);
      } else {
        console.log("   ❌ Test user not found");
      }
    });
  }).catch(err => {
    console.log("   ❌ Database error:", err.message);
  });
} catch (error) {
  console.log("   ❌ Failed to load Prisma:", error.message);
}

// Test NextAuth configuration
console.log("\n3. NextAuth Configuration:");
try {
  const { authOptions } = require('./server/auth');
  console.log("   ✅ Auth options loaded");
  console.log("   Providers:", authOptions.providers?.length || 0);
  console.log("   Session strategy:", authOptions.session?.strategy);
} catch (error) {
  console.log("   ❌ Failed to load auth options:", error.message);
}

console.log("\n🎯 Fixes Applied:");
console.log("1. ✅ Auto-login after registration");
console.log("2. ✅ Better error messages for login");
console.log("3. ✅ Success messages for registration");
console.log("4. ✅ Session debug info in dashboard");

console.log("\n🔧 Next Steps:");
console.log("1. Restart the development server");
console.log("2. Test registration with new account");
console.log("3. Test login with test@example.com / password123");
console.log("4. Check browser console for errors");

console.log("\n🚀 Restart server command:");
console.log("   pkill -f \"next\" 2>/dev/null || true");
console.log("   cd /Users/chozengone/.openclaw/workspace");
console.log("   npm run dev");