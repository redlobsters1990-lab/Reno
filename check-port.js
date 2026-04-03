// Check which port the server is running on
console.log("🔍 Checking Server Port Configuration...\n");

// Check environment
console.log("1. Current Environment Variables:");
console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "Not set");
console.log("   APP_URL:", process.env.APP_URL || "Not set");

// Check if server is running
console.log("\n2. Server Status:");
console.log("   Expected URL: http://localhost:3000");
console.log("   If port 3000 is busy, Next.js will auto-select another port");

// Common issues
console.log("\n3. Common Port Issues:");
console.log("   a. Port 3000 might be in use by another app");
console.log("   b. Next.js might have auto-selected port 3001");
console.log("   c. Check terminal where 'npm run dev' is running");
console.log("   d. Look for: 'ready started server on [::]:3000'");

// How to check
console.log("\n4. How to Check Running Port:");
console.log("   In terminal where 'npm run dev' is running:");
console.log("   Look for line: '▲ Next.js 15.x.x'");
console.log("   Look for line: '- Local: http://localhost:XXXX'");
console.log("   The XXXX is your actual port");

// Fix if wrong port
console.log("\n5. If Server is on Wrong Port:");
console.log("   Option A: Kill and restart");
console.log("     pkill -f 'next' 2>/dev/null || true");
console.log("     npm run dev");
console.log("   ");
console.log("   Option B: Force port 3000");
console.log("     pkill -f 'next' 2>/dev/null || true");
console.log("     PORT=3000 npm run dev");
console.log("   ");
console.log("   Option C: Update .env.local if on different port");
console.log("     Change NEXTAUTH_URL to actual port");

// Test URLs
console.log("\n6. Test These URLs:");
console.log("   http://localhost:3000/");
console.log("   http://localhost:3000/auth/signin");
console.log("   http://localhost:3000/auth/signup");

console.log("\n🚀 Quick Fix:");
console.log("1. Check terminal for actual port");
console.log("2. Update .env.local NEXTAUTH_URL to match");
console.log("3. Restart server if needed");