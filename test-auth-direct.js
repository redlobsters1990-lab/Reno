// Direct test of authentication APIs
const http = require('http');

console.log("🔍 Testing Authentication APIs Directly...\n");

// Test 1: Check if server is responding
console.log("1. Testing server response on port 3000...");
const testServer = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`   ✅ Server responding: HTTP ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Server not responding on port 3000: ${err.message}`);
      console.log("   Trying port 3001...");
      
      // Try port 3001
      const req2 = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`   ✅ Server responding on port 3001: HTTP ${res.statusCode}`);
        console.log("   ⚠️  Update .env.local NEXTAUTH_URL to http://localhost:3001");
        resolve(true);
      });
      
      req2.on('error', () => {
        console.log("   ❌ Server not responding on port 3001 either");
        console.log("   Check if server is running: npm run dev");
        resolve(false);
      });
      
      req2.end();
    });
    
    req.end();
  });
};

// Test 2: Test signup API
const testSignupAPI = async () => {
  console.log("\n2. Testing signup API...");
  
  const testData = JSON.stringify({
    name: "Test User " + Date.now(),
    email: "test" + Date.now() + "@example.com",
    password: "password123"
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    },
    timeout: 10000
  };
  
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log("   ✅ Signup API working");
            console.log("   Created user:", json.user?.email);
          } else {
            console.log("   ❌ Signup API error:", json.error);
          }
        } catch (e) {
          console.log("   ❌ Invalid JSON response");
        }
        resolve(res.statusCode === 201);
      });
    });
    
    req.on('error', (err) => {
      console.log("   ❌ Signup API request failed:", err.message);
      resolve(false);
    });
    
    req.write(testData);
    req.end();
  });
};

// Test 3: Test NextAuth session endpoint
const testSessionAPI = async () => {
  console.log("\n3. Testing NextAuth session endpoint...");
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/session',
    method: 'GET',
    timeout: 5000
  };
  
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log("   Session response:", Object.keys(json));
          if (json.user) {
            console.log("   ✅ Session endpoint working");
          } else {
            console.log("   ℹ️  No active session (expected if not logged in)");
          }
        } catch (e) {
          console.log("   ❌ Invalid JSON response");
        }
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log("   ❌ Session API request failed:", err.message);
      resolve(false);
    });
    
    req.end();
  });
};

// Run tests
(async () => {
  const serverUp = await testServer();
  
  if (serverUp) {
    await testSignupAPI();
    await testSessionAPI();
    
    console.log("\n🎯 Summary:");
    console.log("1. Check .env.local NEXTAUTH_URL matches actual port");
    console.log("2. Test in browser: http://localhost:3000/auth/signup");
    console.log("3. Check browser console for errors (F12)");
    console.log("4. Check server terminal for backend errors");
  } else {
    console.log("\n🚨 Server not running. Start it with:");
    console.log("   cd /Users/chozengone/.openclaw/workspace");
    console.log("   npm run dev");
  }
})();