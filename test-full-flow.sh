#!/bin/bash
echo "=== COMPLETE AUTH & PROJECT CREATION FLOW TEST ==="
echo ""

# Generate unique email to avoid conflicts
TIMESTAMP=$(date +%s)
TEST_EMAIL="flowtest_${TIMESTAMP}@example.com"
TEST_PASSWORD="Test123!"

echo "1. Creating test user: $TEST_EMAIL"
curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Flow Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -w " -> %{http_code}\n"

echo ""
echo "2. Logging in to get auth cookie..."
curl -s -X POST http://localhost:3000/api/direct-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -w " -> %{http_code}\n" \
  -c /tmp/flow-cookies.txt

echo ""
echo "3. Testing project creation with valid auth..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -b /tmp/flow-cookies.txt \
  -d '{"name":"Flow Test Project","propertySize":"1200","rooms":"4","notes":"Test from flow script"}')

STATUS=$?
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -b /tmp/flow-cookies.txt \
  -d '{"name":"Flow Test Project","propertySize":"1200","rooms":"4","notes":"Test from flow script"}')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE"

echo ""
echo "4. Checking what cookies we have..."
cat /tmp/flow-cookies.txt

echo ""
echo "=== ANALYSIS ==="
if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ SUCCESS: Project creation works!"
  echo "The issue users are experiencing is likely:"
  echo "1. Old/invalid cookies in their browser"
  echo "2. Need to clear cookies and sign in again"
else
  echo "❌ FAILED: HTTP $HTTP_CODE"
  echo "Error details: $RESPONSE"
  echo ""
  echo "Debugging steps:"
  echo "1. Check server logs for errors"
  echo "2. Verify database connection"
  echo "3. Check Prisma schema matches API"
fi

echo ""
echo "=== RECOMMENDED FIX ==="
echo "Users should:"
echo "1. Clear browser cookies for localhost:3000"
echo "2. Sign in again"
echo "3. Try creating project"
echo ""
echo "Or use the test page: /test-project-create.html"
