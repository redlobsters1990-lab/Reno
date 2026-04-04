// Fix ChatMessage schema drift
// This script fixes the NULL conversationId issue causing Prisma Studio failures

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixChatMessageSchema() {
  console.log('=== FIXING CHATMESSAGE SCHEMA DRIFT ===\n');
  
  try {
    // Step 1: Identify problematic records
    console.log('1. Finding ChatMessage records with NULL conversationId...');
    const nullConversationMessages = await prisma.$queryRaw`
      SELECT id, "userId", "projectId", role, LEFT(content, 100) as preview
      FROM "ChatMessage"
      WHERE "conversationId" IS NULL
    `;
    
    console.log(`   Found ${nullConversationMessages.length} records with NULL conversationId`);
    
    if (nullConversationMessages.length === 0) {
      console.log('   ✅ No problematic records found');
      return;
    }
    
    // Step 2: Create a default conversation for orphaned messages
    console.log('\n2. Creating default conversation for orphaned messages...');
    
    // Find a user to associate with the default conversation
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      throw new Error('No users found in database');
    }
    
    // Create a default conversation
    const defaultConversation = await prisma.conversation.create({
      data: {
        userId: firstUser.id,
        title: 'Orphaned Messages Recovery',
        status: 'archived',
        metadata: JSON.stringify({
          createdBy: 'schema-fix-script',
          reason: 'Recovery for messages with NULL conversationId',
          timestamp: new Date().toISOString()
        })
      }
    });
    
    console.log(`   Created default conversation: ${defaultConversation.id}`);
    
    // Step 3: Update orphaned messages to point to default conversation
    console.log('\n3. Updating orphaned messages...');
    
    const updateResult = await prisma.$executeRaw`
      UPDATE "ChatMessage"
      SET "conversationId" = ${defaultConversation.id}
      WHERE "conversationId" IS NULL
    `;
    
    console.log(`   Updated ${updateResult} records`);
    
    // Step 4: Verify fix
    console.log('\n4. Verifying fix...');
    const remainingNull = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "ChatMessage"
      WHERE "conversationId" IS NULL
    `;
    
    if (remainingNull[0].count === 0) {
      console.log('   ✅ All NULL conversationId values fixed');
    } else {
      console.log(`   ⚠️ Still ${remainingNull[0].count} NULL values remaining`);
    }
    
    // Step 5: Test count query
    console.log('\n5. Testing ChatMessage count query...');
    try {
      const count = await prisma.chatMessage.count();
      console.log(`   ✅ ChatMessage.count() works: ${count} records`);
    } catch (error) {
      console.log(`   ❌ ChatMessage.count() still failing: ${error.message}`);
    }
    
    console.log('\n🎉 Schema drift fix completed');
    
  } catch (error) {
    console.error('❌ Error fixing schema drift:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run fix
fixChatMessageSchema()
  .then(() => {
    console.log('\n✅ Fix script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fix script failed:', error);
    process.exit(1);
  });