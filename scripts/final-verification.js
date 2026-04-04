// Final System Verification
// Verify all critical fixes are working

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllFixes() {
  console.log('=== FINAL SYSTEM VERIFICATION ===\n');
  
  let allPassed = true;
  
  // 1. Verify Prisma Studio count queries work
  console.log('1. Testing all Prisma model count queries...');
  const models = [
    'user', 'account', 'session', 'verificationToken',
    'project', 'conversation', 'chatMessage',
    'userLongTermMemory', 'projectShortTermMemory',
    'costEstimate', 'contractorQuote', 'quoteLineItem',
    'uploadedFile', 'job', 'costEvent', 'userActivity',
    'projectSession'
  ];
  
  for (const model of models) {
    try {
      const count = await prisma[model].count();
      console.log(`   ✅ ${model}: ${count} records`);
    } catch (error) {
      console.log(`   ❌ ${model}: FAILED - ${error.message}`);
      allPassed = false;
    }
  }
  
  // 2. Verify ChatMessage.conversationId has no NULL values
  console.log('\n2. Checking ChatMessage.conversationId NULL values...');
  try {
    const nullCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "ChatMessage"
      WHERE "conversationId" IS NULL
    `;
    
    if (nullCount[0].count === 0) {
      console.log('   ✅ No NULL conversationId values');
    } else {
      console.log(`   ❌ ${nullCount[0].count} NULL values found`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Query failed: ${error.message}`);
    allPassed = false;
  }
  
  // 3. Verify indexes were created
  console.log('\n3. Verifying critical indexes exist...');
  const expectedIndexes = [
    'Account_userId_idx',
    'ChatMessage_userId_idx',
    'ContractorQuote_userId_idx',
    'CostEstimate_userId_idx',
    'CostEvent_conversationId_idx',
    'CostEvent_jobId_idx',
    'QuoteLineItem_userId_idx',
    'Session_userId_idx',
    'UploadedFile_userId_idx'
  ];
  
  try {
    const existingIndexes = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname IN (
        'Account_userId_idx',
        'ChatMessage_userId_idx',
        'ContractorQuote_userId_idx',
        'CostEstimate_userId_idx',
        'CostEvent_conversationId_idx',
        'CostEvent_jobId_idx',
        'QuoteLineItem_userId_idx',
        'Session_userId_idx',
        'UploadedFile_userId_idx'
      )
    `;
    
    const existingIndexNames = existingIndexes.map(idx => idx.indexname);
    const missingIndexes = expectedIndexes.filter(idx => !existingIndexNames.includes(idx));
    
    if (missingIndexes.length === 0) {
      console.log('   ✅ All critical indexes created');
    } else {
      console.log(`   ❌ Missing indexes: ${missingIndexes.join(', ')}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Index check failed: ${error.message}`);
    allPassed = false;
  }
  
  // 4. Verify database is managed by Prisma Migrate
  console.log('\n4. Checking Prisma Migrate status...');
  try {
    // Check if _prisma_migrations table exists
    const migrationsTable = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = '_prisma_migrations'
    `;
    
    if (migrationsTable[0].count > 0) {
      console.log('   ✅ Database managed by Prisma Migrate');
    } else {
      console.log('   ❌ _prisma_migrations table not found');
      allPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Migration check failed: ${error.message}`);
    allPassed = false;
  }
  
  // 5. Verify application services
  console.log('\n5. Testing application services...');
  try {
    // Test user query (most basic operation)
    const userCount = await prisma.user.count();
    console.log(`   ✅ User service: ${userCount} users`);
    
    // Test project query
    const projectCount = await prisma.project.count();
    console.log(`   ✅ Project service: ${projectCount} projects`);
    
    // Test conversation query
    const conversationCount = await prisma.conversation.count();
    console.log(`   ✅ Conversation service: ${conversationCount} conversations`);
    
  } catch (error) {
    console.log(`   ❌ Service test failed: ${error.message}`);
    allPassed = false;
  }
  
  await prisma.$disconnect();
  
  console.log('\n=== VERIFICATION SUMMARY ===');
  if (allPassed) {
    console.log('✅ ALL CRITICAL FIXES VERIFIED AND WORKING');
    console.log('\n🎉 System is ready for pre-production validation!');
    console.log('\nRemaining work for production:');
    console.log('1. Configure real AI/OCR services');
    console.log('2. Implement comprehensive monitoring');
    console.log('3. Complete test suite');
    console.log('4. Load testing and optimization');
  } else {
    console.log('❌ SOME VERIFICATIONS FAILED');
    console.log('\n⚠️ System needs additional fixes before pre-production');
  }
  
  return allPassed;
}

// Run verification
verifyAllFixes()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification error:', error);
    process.exit(1);
  });