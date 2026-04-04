// Test Prisma Engine directly
const { PrismaClient } = require('@prisma/client');

async function testPrismaEngine() {
  console.log('=== TESTING PRISMA ENGINE DIRECTLY ===\n');
  
  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' }
    ]
  });
  
  // Capture query logs
  const queries = [];
  prisma.$on('query', (e) => {
    queries.push({
      timestamp: new Date(),
      query: e.query,
      params: e.params,
      duration: e.duration,
      target: e.target
    });
  });
  
  prisma.$on('error', (e) => {
    console.log('Prisma Error:', e);
  });
  
  prisma.$on('warn', (e) => {
    console.log('Prisma Warn:', e);
  });
  
  try {
    // Test 1: Simple query to check engine is working
    console.log('1. Testing engine connection...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`   ✅ Engine connection: ${result[0].test}`);
    
    // Test 2: Test each model with a simple query
    console.log('\n2. Testing each model...');
    const models = ['user', 'project', 'conversation', 'chatMessage'];
    
    for (const model of models) {
      try {
        // Try to get table info
        const tableInfo = await prisma.$queryRaw`
          SELECT COUNT(*) as count, 
                 MIN("id") as min_id,
                 MAX("id") as max_id
          FROM "${model}"
        `;
        
        console.log(`   ✅ ${model}: ${tableInfo[0].count} records`);
        
        // Try Prisma count
        const prismaCount = await prisma[model].count();
        console.log(`      Prisma count: ${prismaCount}`);
        
      } catch (error) {
        console.log(`   ❌ ${model}: ${error.message}`);
      }
    }
    
    // Test 3: Check for any system tables that might confuse Prisma
    console.log('\n3. Checking for potential conflict tables...');
    const systemTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE '%prisma%'
      OR table_name LIKE '%migration%'
      OR table_name LIKE '%studio%'
    `;
    
    if (systemTables.length > 0) {
      console.log('   Found potential conflict tables:');
      systemTables.forEach(t => console.log(`      - ${t.table_name}`));
    } else {
      console.log('   ✅ No conflict tables found');
    }
    
    // Test 4: Check _prisma_migrations table
    console.log('\n4. Checking _prisma_migrations table...');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, applied_at
        FROM _prisma_migrations
        ORDER BY applied_at DESC
        LIMIT 5
      `;
      console.log(`   ✅ Migration table accessible: ${migrations.length} migrations`);
    } catch (error) {
      console.log(`   ❌ Migration table error: ${error.message}`);
    }
    
    console.log('\n=== QUERY LOG ===');
    queries.forEach((q, i) => {
      console.log(`${i + 1}. ${q.query} (${q.duration}ms)`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaEngine().catch(console.error);