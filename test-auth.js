// Test authentication flow
const testAuth = async () => {
  console.log("🔍 Testing Authentication Flow...\n");
  
  // Test 1: Check if test user exists
  console.log("1. Checking test user in database...");
  try {
    const { prisma } = require('./server/db');
    const testUser = await prisma.user.findUnique({
      where: { email: "test@example.com" }
    });
    
    if (testUser) {
      console.log("✅ Test user exists:", testUser.email);
      console.log("   ID:", testUser.id);
      console.log("   Name:", testUser.name);
      console.log("   Created:", testUser.createdAt);
    } else {
      console.log("❌ Test user not found in database");
    }
  } catch (error) {
    console.log("❌ Database error:", error.message);
  }
  
  console.log("\n2. Testing signup API...");
  // Test 2: Test signup API
  const testSignup = async () => {
    const testData = {
      name: "Test User 2",
      email: "test2@example.com",
      password: "password123"
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      console.log("   Status:", response.status);
      console.log("   Response:", data);
      
      if (response.ok) {
        console.log("✅ Signup API working");
      } else {
        console.log("❌ Signup API error:", data.error);
      }
    } catch (error) {
      console.log("❌ Signup API request failed:", error.message);
    }
  };
  
  await testSignup();
  
  console.log("\n3. Testing login flow...");
  // Test 3: Simulate login
  const testLogin = async () => {
    const loginData = {
      email: "test@example.com",
      password: "password123"
    };
    
    try {
      // This would normally be done via NextAuth
      const { prisma } = require('./server/db');
      const { compare } = require('bcryptjs');
      
      const user = await prisma.user.findUnique({
        where: { email: loginData.email }
      });
      
      if (user && user.passwordHash) {
        const isValid = await compare(loginData.password, user.passwordHash);
        console.log("   Password validation:", isValid ? "✅ Valid" : "❌ Invalid");
      } else {
        console.log("❌ User or password hash not found");
      }
    } catch (error) {
      console.log("❌ Login test error:", error.message);
    }
  };
  
  await testLogin();
  
  console.log("\n4. Checking NextAuth configuration...");
  // Test 4: Check environment
  console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("   NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
  console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
  
  console.log("\n🔧 Recommendations:");
  console.log("1. Check browser console for errors (F12 → Console)");
  console.log("2. Check server logs for authentication errors");
  console.log("3. Verify database connection is working");
  console.log("4. Check if cookies are being set properly");
  console.log("5. Test with different browser/incognito mode");
};

// Run test
testAuth().catch(console.error);