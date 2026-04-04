// Final Complete Seed Script
// Creates all necessary pre-production test accounts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedFinalComplete() {
  console.log('=== SEEDING COMPLETE PRE-PRODUCTION DATA ===');
  
  try {
    // Test user accounts with hashed passwords
    const testUsers = [
      {
        email: 'standard@example.com',
        name: 'Standard User',
        passwordHash: await hash('Password123!', 12),
        role: 'user' as const,
        status: 'active' as const,
        emailVerified: new Date()
      },
      {
        email: 'heavy@example.com',
        name: 'Heavy Usage User',
        passwordHash: await hash('Password123!', 12),
        role: 'user' as const,
        status: 'active' as const,
        emailVerified: new Date()
      },
      {
        email: 'edge@example.com',
        name: 'Edge Case User',
        passwordHash: await hash('Password123!', 12),
        role: 'user' as const,
        status: 'active' as const,
        emailVerified: new Date()
      },
      {
        email: 'suspended@example.com',
        name: 'Suspended User',
        passwordHash: await hash('Password123!', 12),
        role: 'user' as const,
        status: 'suspended' as const,
        emailVerified: new Date()
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        passwordHash: await hash('Admin123!', 12),
        role: 'admin' as const,
        status: 'active' as const,
        emailVerified: new Date()
      }
    ];

    // Create or update users
    console.log('\n1. Creating test users...');
    const users = [];
    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existing) {
        console.log(`  ✓ Already exists: ${userData.email}`);
        users.push(existing);
      } else {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`  ✓ Created: ${user.email} (${user.role})`);
        users.push(user);
      }
    }

    // Create projects for standard user
    console.log('\n2. Creating test projects...');
    const standardUser = users.find(u => u.email === 'standard@example.com');
    if (standardUser) {
      const project = await prisma.project.create({
        data: {
          userId: standardUser.id,
          title: 'Kitchen Renovation',
          propertyType: 'apartment',
          roomCount: 1,
          budget: 25000,
          stylePreference: 'modern',
          notes: 'Complete kitchen remodel with new cabinets and appliances',
          status: 'planning'
        }
      });
      console.log(`  ✓ Created project: ${project.title}`);
      
      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          id: `conv-${Date.now()}`,
          userId: standardUser.id,
          projectId: project.id,
          title: 'Kitchen Design Discussion',
          status: 'active'
        }
      });
      console.log(`  ✓ Created conversation: ${conversation.title}`);
      
      // Create chat messages
      await prisma.chatMessage.createMany({
        data: [
          {
            userId: standardUser.id,
            conversationId: conversation.id,
            projectId: project.id,
            role: 'user',
            content: 'I want to remodel my kitchen with a modern style.'
          },
          {
            userId: standardUser.id,
            conversationId: conversation.id,
            projectId: project.id,
            role: 'assistant',
            content: 'Great! A modern kitchen renovation typically costs $15,000-$35,000. What\'s your budget range?'
          }
        ]
      });
      console.log(`  ✓ Created chat messages`);
      
      // Create cost estimate
      const estimate = await prisma.costEstimate.create({
        data: {
          userId: standardUser.id,
          projectId: project.id,
          lowEstimate: 15000,
          highEstimate: 35000,
          confidence: 'medium',
          assumptions: 'Standard materials, mid-range appliances',
          breakdown: JSON.stringify({
            cabinets: { low: 5000, high: 12000 },
            countertops: { low: 2000, high: 6000 },
            appliances: { low: 3000, high: 8000 },
            labor: { low: 5000, high: 9000 }
          })
        }
      });
      console.log(`  ✓ Created cost estimate: $${estimate.lowEstimate}-$${estimate.highEstimate}`);
      
      // Create AI job record
      const job = await prisma.job.create({
        data: {
          id: `job-${Date.now()}`,
          userId: standardUser.id,
          projectId: project.id,
          jobType: 'cost_estimation',
          status: 'completed',
          input: 'Kitchen renovation cost estimation',
          output: JSON.stringify({ estimate: '15000-35000', confidence: 'medium' })
        }
      });
      console.log(`  ✓ Created AI job: ${job.jobType}`);
      
      // Create cost event
      await prisma.costEvent.create({
        data: {
          id: `cost-${Date.now()}`,
          userId: standardUser.id,
          projectId: project.id,
          jobId: job.id,
          eventType: 'cost_estimation',
          units: 1,
          cost: 0.05,
          currency: 'USD'
        }
      });
      console.log(`  ✓ Created cost event`);
      
      // Create user activity
      await prisma.userActivity.create({
        data: {
          id: `activity-${Date.now()}`,
          userId: standardUser.id,
          activityType: 'project_create',
          description: 'Created kitchen renovation project',
          entityType: 'Project',
          entityId: project.id
        }
      });
      console.log(`  ✓ Created user activity`);
    }

    // Create multiple projects for heavy user
    console.log('\n3. Creating heavy usage data...');
    const heavyUser = users.find(u => u.email === 'heavy@example.com');
    if (heavyUser) {
      const projectTypes = ['Bathroom Remodel', 'Whole House Renovation', 'Office Conversion', 'Outdoor Deck'];
      for (const title of projectTypes) {
        await prisma.project.create({
          data: {
            userId: heavyUser.id,
            title,
            propertyType: 'house',
            roomCount: Math.floor(Math.random() * 5) + 1,
            budget: Math.floor(Math.random() * 50000) + 10000,
            status: 'planning'
          }
        });
      }
      console.log(`  ✓ Created 4 projects for heavy user`);
    }

    console.log('\n✅ SEEDING COMPLETE');
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('Standard User: standard@example.com / Password123!');
    console.log('Heavy User: heavy@example.com / Password123!');
    console.log('Edge User: edge@example.com / Password123!');
    console.log('Suspended User: suspended@example.com / Password123!');
    console.log('Admin: admin@example.com / Admin123!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedFinalComplete()
    .then(() => {
      console.log('\n🎉 Seed script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error);
      process.exit(1);
    });
}

export { seedFinalComplete };