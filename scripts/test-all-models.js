// Test all Prisma models for count query failures
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAllModels() {
  console.log('=== TESTING ALL PRISMA MODELS ===\n');
  
  // List all Prisma models from schema
  const models = [
    'user',
    'account',
    'session',
    'verificationToken',
    'project',
    'conversation',
    'chatMessage',
    'userLongTermMemory',
    'projectShortTermMemory',
    'costEstimate',
    'contractorQuote',
    'quoteLineItem',
    'uploadedFile',
    'job',
    'costEvent',
    'userActivity',
    'projectSession'
  ];

  const results = [];
  let hasFailures = false;

  for (const model of models) {
    console.log(`Testing ${model}...`);
    
    try {
      // Test count()
      const count = await prisma[model].count();
      console.log(`  ✅ count(): ${count} records`);
      
      // Test findFirst()
      const first = await prisma[model].findFirst();
      console.log(`  ✅ findFirst(): ${first ? 'found' : 'not found'}`);
      
      // Test findMany with limit
      const many = await prisma[model].findMany({ take: 1 });
      console.log(`  ✅ findMany(take: 1): ${many.length} records`);
      
      results.push({
        model,
        status: 'PASS',
        count,
        findFirst: !!first,
        findMany: many.length
      });
      
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      results.push({
        model,
        status: 'FAIL',
        error: error.message
      });
      hasFailures = true;
    }
    
    console.log('');
  }

  console.log('=== SUMMARY ===\n');
  
  const passing = results.filter(r => r.status === 'PASS').length;
  const failing = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`Total models: ${results.length}`);
  console.log(`Passing: ${passing}`);
  console.log(`Failing: ${failing}`);
  
  if (failing > 0) {
    console.log('\n=== FAILING MODELS ===');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`- ${r.model}: ${r.error}`);
    });
  }

  await prisma.$disconnect();
  return { results, hasFailures };
}

// Run test
testAllModels()
  .then(({ results, hasFailures }) => {
    console.log('\n' + (hasFailures ? '❌ SOME MODELS FAILED' : '✅ ALL MODELS PASSED'));
    process.exit(hasFailures ? 1 : 0);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });