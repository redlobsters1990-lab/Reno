// Debug script to isolate count query failures
const { PrismaClient } = require('@prisma/client');

async function debugCountQueries() {
  console.log('=== DEBUGGING COUNT QUERY FAILURES ===\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  });
  
  // List all models from schema
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
  
  for (const model of models) {
    console.log(`\n--- Testing ${model} ---`);
    
    // Test 1: count()
    try {
      console.log(`1. Testing ${model}.count()...`);
      const count = await prisma[model].count();
      console.log(`   ✅ count(): ${count} records`);
      results.push({ model, test: 'count', success: true, result: count });
    } catch (error) {
      console.log(`   ❌ count() FAILED: ${error.message}`);
      console.log(`   Error details:`, error);
      results.push({ model, test: 'count', success: false, error: error.message });
    }
    
    // Test 2: findFirst()
    try {
      console.log(`2. Testing ${model}.findFirst()...`);
      const first = await prisma[model].findFirst();
      console.log(`   ✅ findFirst(): ${first ? 'found' : 'not found'}`);
      results.push({ model, test: 'findFirst', success: true, result: !!first });
    } catch (error) {
      console.log(`   ❌ findFirst() FAILED: ${error.message}`);
      results.push({ model, test: 'findFirst', success: false, error: error.message });
    }
    
    // Test 3: findMany({ take: 1 })
    try {
      console.log(`3. Testing ${model}.findMany({ take: 1 })...`);
      const many = await prisma[model].findMany({ take: 1 });
      console.log(`   ✅ findMany(): ${many.length} records`);
      results.push({ model, test: 'findMany', success: true, result: many.length });
    } catch (error) {
      console.log(`   ❌ findMany() FAILED: ${error.message}`);
      results.push({ model, test: 'findMany', success: false, error: error.message });
    }
    
    // Test 4: Raw count query
    try {
      console.log(`4. Testing raw COUNT query...`);
      const rawCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "${model}"`;
      console.log(`   ✅ Raw COUNT: ${rawCount[0]?.count || 0} records`);
      results.push({ model, test: 'rawCount', success: true, result: rawCount[0]?.count });
    } catch (error) {
      console.log(`   ❌ Raw COUNT FAILED: ${error.message}`);
      results.push({ model, test: 'rawCount', success: false, error: error.message });
    }
  }
  
  console.log('\n\n=== SUMMARY ===');
  console.log('Models tested:', models.length);
  
  const failingModels = results.filter(r => !r.success);
  const failingCount = failingModels.length;
  
  if (failingCount === 0) {
    console.log('✅ All models passed all tests');
  } else {
    console.log(`❌ ${failingCount} test failures found:`);
    
    // Group by model
    const failuresByModel = {};
    failingModels.forEach(f => {
      if (!failuresByModel[f.model]) failuresByModel[f.model] = [];
      failuresByModel[f.model].push(f.test);
    });
    
    Object.entries(failuresByModel).forEach(([model, tests]) => {
      console.log(`   - ${model}: ${tests.join(', ')} failed`);
    });
    
    // Show detailed errors for first failing model
    const firstFailure = failingModels[0];
    console.log(`\nDetailed error for ${firstFailure.model}.${firstFailure.test}:`);
    console.log(`   ${firstFailure.error}`);
  }
  
  await prisma.$disconnect();
  return results;
}

debugCountQueries().catch(console.error);