// Simple seed script for testing
import { prisma } from '../server/db';
import { hashPassword } from '../server/auth';

async function seedSimple() {
  console.log('=== SIMPLE SEED SCRIPT ===');
  
  try {
    // Create test users if they don't exist
    const testUsers = [
      {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
        role: 'admin'
      }
    ];
    
    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!existing) {
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            passwordHash: await hashPassword(userData.password),
            emailVerified: new Date(),
            role: userData.role || 'user',
            status: 'active'
          }
        });
        console.log(`✓ Created user: ${user.email}`);
      } else {
        console.log(`✓ User already exists: ${userData.email}`);
      }
    }
    
    // Create a test project
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (testUser) {
      const existingProject = await prisma.project.findFirst({
        where: { userId: testUser.id }
      });
      
      if (!existingProject) {
        const project = await prisma.project.create({
          data: {
            userId: testUser.id,
            title: 'Test Kitchen Renovation',
            propertyType: 'HDB',
            roomCount: 1,
            budget: 35000,
            stylePreference: 'Modern',
            notes: 'Test project for development',
            status: 'active'
          }
        });
        console.log(`✓ Created project: ${project.title}`);
        
        // Create a cost estimate
        const estimate = await prisma.costEstimate.create({
          data: {
            userId: testUser.id,
            projectId: project.id,
            leanMin: 15000,
            leanMax: 25000,
            realisticMin: 25000,
            realisticMax: 40000,
            stretchMin: 40000,
            stretchMax: 70000,
            confidence: 'high',
            assumptions: 'Test assumptions',
            costDrivers: 'Test cost drivers'
          }
        });
        console.log(`✓ Created cost estimate: SGD ${estimate.leanMin} - ${estimate.stretchMax}`);
      } else {
        console.log(`✓ Project already exists for user`);
      }
    }
    
    // Test new tables
    console.log('\n=== TESTING NEW TABLES ===');
    
    // Create a conversation
    if (testUser) {
      const project = await prisma.project.findFirst({
        where: { userId: testUser.id }
      });
      
      if (project) {
        const conversation = await prisma.conversation.create({
          data: {
            userId: testUser.id,
            projectId: project.id,
            title: 'Test Conversation',
            status: 'active'
          }
        });
        console.log(`✓ Created conversation: ${conversation.title}`);
        
        // Create a chat message
        const message = await prisma.chatMessage.create({
          data: {
            userId: testUser.id,
            conversationId: conversation.id,
            projectId: project.id,
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        });
        console.log(`✓ Created chat message`);
        
        // Create a job record
        const job = await prisma.job.create({
          data: {
            userId: testUser.id,
            conversationId: conversation.id,
            projectId: project.id,
            jobType: 'chat_generation',
            status: 'completed',
            input: JSON.stringify({ message: 'Test input' }),
            output: JSON.stringify({ response: 'Test output' })
          }
        });
        console.log(`✓ Created job record: ${job.jobType}`);
        
        // Create a cost event
        const costEvent = await prisma.costEvent.create({
          data: {
            userId: testUser.id,
            projectId: project.id,
            conversationId: conversation.id,
            jobId: job.id,
            eventType: 'chat_message',
            units: 1,
            cost: 0.01,
            currency: 'USD'
          }
        });
        console.log(`✓ Created cost event: ${costEvent.eventType}`);
        
        // Create user activity
        const activity = await prisma.userActivity.create({
          data: {
            userId: testUser.id,
            activityType: 'login',
            description: 'User logged in',
            ipAddress: '127.0.0.1',
            userAgent: 'Test Agent'
          }
        });
        console.log(`✓ Created user activity: ${activity.activityType}`);
      }
    }
    
    console.log('\n✅ SEEDING COMPLETE');
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('User: test@example.com / password123');
    console.log('Admin: admin@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedSimple()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedSimple };