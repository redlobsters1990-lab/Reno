// Test to see the exact error format from signup
const fetch = require('node-fetch');

async function testSignup() {
  try {
    // Wait for rate limit to reset
    console.log("Waiting 10 seconds for rate limit...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'formattest@example.com',
        password: 'simple'  // This will fail validation
      })
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Error format:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Test error:", error.message);
  }
}

testSignup();
