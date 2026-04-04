// Pre-Production Database Seed Script (Fixed)
// Phase 2: Create realistic test accounts and data

import { prisma } from '../server/db';
import { hashPassword } from '../server/auth';
import { logger } from '../lib/logger';

async function seedPreProduction() {
  console.log('=== SEEDING PRE-PRODUCTION DATABASE ===');
  console.log('Date:', new Date().toISOString());
  
  try {
    // Clear existing test data (optional - careful in production!)
    console.log('\n1. Clearing existing test data...');
    await clearTestData();
    
    // Create user accounts
    console.log('\n2. Creating pre-production user accounts...');
    const users = await createUserAccounts();
    
    // Create projects
    console.log('\n3. Creating test projects...');
    const projects = await createTestProjects(users);
    
    // Create conversations and chat messages
    console.log('\n4. Creating conversations and messages...');
    const conversations = await createConversations(users, projects);
    
    // Create uploaded files
    console.log('\n5. Creating uploaded files...');
    const files = await createUploadedFiles(users, projects);
    
    // Create cost estimates
    console.log('\n6. Creating cost estimates...');
    const estimates = await createCostEstimates(users, projects);
    
    // Create contractor quotes
    console.log('\n7. Creating contractor quotes...');
    const quotes = await createContractorQuotes(users, projects);
    
    // Create AI jobs and usage records
    console.log('\n8. Creating AI usage records...');
    const jobs = await createAIUsageRecords(users, projects);
    
    // Create contractor profiles
    console.log('\n9. Creating contractor profiles...');
    const contractors = await createContractorProfiles();
    
    // Create contractor matches
    console.log('\n10. Creating contractor matches...');
    const matches = await createContractorMatches(users, projects, contractors);
    
    // Create timeline predictions
    console.log('\n11. Creating timeline predictions...');
    const predictions = await createTimelinePredictions(users, projects);
    
    // Create user activity logs
    console.log('\n12. Creating activity logs...');
    const activities = await createActivityLogs(users, projects);
    
    // Summary
    console.log('\n=== SEEDING COMPLETE ===');
    console.log('Accounts created:', users.length);
    console.log('Projects created:', projects.length);
    console.log('Conversations created:', conversations.length);
    console.log('Messages created:', conversations.reduce((sum, c) => sum + c.messageCount, 0));
    console.log('Files uploaded:', files.length);
    console.log('Cost estimates:', estimates.length);
    console.log('Contractor quotes:', quotes.length);
    console.log('AI jobs recorded:', jobs.length);
    console.log('Contractor profiles:', contractors.length);
    console.log('Contractor matches:', matches.length);
    console.log('Timeline predictions:', predictions.length);
    console.log('Activity logs:', activities.length);
    
    // Test credentials
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('Standard User:');
    console.log('  Email: standard@example.com');
    console.log('  Password: password123');
    console.log('\nHeavy Usage User:');
    console.log('  Email: heavy@example.com');
    console.log('  Password: password123');
    console.log('\nEdge Case User:');
    console.log('  Email: edge@example.com');
    console.log('  Password: password123');
    console.log('\nAdmin User:');
    console.log('  Email: admin@example.com');
    console.log('  Password: password123');
    
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// ========== SEEDING FUNCTIONS ==========

async function clearTestData() {
  // In production, we might not want to clear all data
  // For now, only clear if explicitly configured
  if (process.env.CLEAR_ALL_DATA !== 'true') {
    console.log('Skipping data clearance (set CLEAR_ALL_DATA=true to clear)');
    return;
  }
  
  // Clear tables in safe order (respecting foreign keys)
  const tables = [
    'ContractorMatchResult',
    'TimelinePrediction',
    'CostEvent',
    'UserActivity',
    'Job',
    'QuoteLineItem',
    'ContractorQuote',
    'CostEstimate',
    'UploadedFile',
    'ChatMessage',
    'Conversation',
    'ProjectShortTermMemory',
    'ProjectSession',
    'Project',
    'UserLongTermMemory',
    'Session',
    'Account',
    'User'
  ];
  
  for (const table of tables) {
    try {
      await (prisma as any)[table.toLowerCase()].deleteMany({});
      console.log(`  Cleared ${table}`);
    } catch (error) {
      console.log(`  Skipped ${table} (may not exist yet)`);
    }
  }
}

async function createUserAccounts() {
  const users = [
    // Standard user (normal usage)
    {
      email: 'standard@example.com',
      name: 'Standard User',
      role: 'user',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    // Heavy usage user
    {
      email: 'heavy@example.com',
      name: 'Heavy User',
      role: 'user',
      status: 'active',
      lastActiveAt: new Date() // Today
    },
    // Edge case user (incomplete data)
    {
      email: 'edge@example.com',
      name: 'Edge Case User',
      role: 'user',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
    },
    // Admin/support user
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      lastActiveAt: new Date()
    },
    // Suspended user
    {
      email: 'suspended@example.com',
      name: 'Suspended User',
      role: 'user',
      status: 'suspended',
      lastActiveAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }
  ];
  
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash: await hashPassword('password123'),
        emailVerified: new Date(),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
      }
    });
    createdUsers.push(user);
    console.log(`  Created user: ${user.email} (${user.role})`);
  }
  
  return createdUsers;
}

async function createTestProjects(users: any[]) {
  const standardUser = users.find(u => u.email === 'standard@example.com');
  const heavyUser = users.find(u => u.email === 'heavy@example.com');
  const edgeUser = users.find(u => u.email === 'edge@example.com');
  
  const projects = [
    // Standard user projects
    {
      userId: standardUser.id,
      title: 'Kitchen Renovation - HDB Flat',
      propertyType: 'HDB',
      roomCount: 1,
      budget: 35000,
      stylePreference: 'Modern minimalist',
      notes: 'Looking to update our 20-year-old kitchen. Want more storage and better lighting.',
      status: 'active'
    },
    {
      userId: standardUser.id,
      title: 'Master Bathroom Update',
      propertyType: 'Condominium',
      roomCount: 1,
      budget: 18000,
      stylePreference: 'Spa-like',
      notes: 'Want to convert to walk-in shower with rainfall showerhead.',
      status: 'active'
    },
    
    // Heavy user projects
    {
      userId: heavyUser.id,
      title: 'Whole House Renovation',
      propertyType: 'Landed',
      roomCount: 5,
      budget: 150000,
      stylePreference: 'Contemporary',
      notes: 'Complete overhaul of 3-bedroom house. Need design consultation.',
      status: 'active'
    },
    {
      userId: heavyUser.id,
      title: 'Home Office Setup',
      propertyType: 'Condominium',
      roomCount: 1,
      budget: 12000,
      stylePreference: 'Professional',
      notes: 'Converting spare bedroom to dedicated home office with built-ins.',
      status: 'archived'
    },
    {
      userId: heavyUser.id,
      title: 'Balcony Garden',
      propertyType: 'Condominium',
      roomCount: 1,
      budget: 8000,
      stylePreference: 'Tropical',
      notes: 'Want to create green space with seating area and planters.',
      status: 'active'
    },
    
    // Edge case user projects
    {
      userId: edgeUser.id,
      title: 'Living Room Refresh',
      propertyType: 'HDB',
      roomCount: 1,
      budget: null, // Incomplete
      stylePreference: null,
      notes: 'Just exploring options for now.',
      status: 'active'
    }
  ];
  
  const createdProjects = [];
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: {
        ...projectData,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date in last 60 days
      }
    });
    createdProjects.push(project);
    console.log(`  Created project: ${project.title} for ${projectData.userId === standardUser.id ? 'standard' : projectData.userId === heavyUser.id ? 'heavy' : 'edge'} user`);
  }
  
  return createdProjects;
}

async function createConversations(users: any[], projects: any[]) {
  const standardUser = users.find(u => u.email === 'standard@example.com');
  const heavyUser = users.find(u => u.email === 'heavy@example.com');
  const standardProjects = projects.filter(p => p.userId === standardUser.id);
  const heavyProjects = projects.filter(p => p.userId === heavyUser.id);
  
  const conversations = [];
  
  // Create conversations for standard user projects
  for (const project of standardProjects) {
    const conversation = await prisma.conversation.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        title: `Chat about ${project.title}`,
        status: 'active',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Add chat messages
    const messages = [
      {
        userId: project.userId,
        conversationId: conversation.id,
        projectId: project.id,
        role: 'user',
        content: `Hi, I need help with my ${project.title.toLowerCase()}. My budget is around SGD ${project.budget?.toLocaleString()}.`,
        createdAt: new Date(conversation.createdAt.getTime() + 1000)
      },
      {
        userId: project.userId,
        conversationId: conversation.id,
        projectId: project.id,
        role: 'assistant',
        content: `I'd be happy to help with your ${project.title.toLowerCase()}! For a budget of SGD ${project.budget?.toLocaleString()}, we can consider several options. Could you tell me more about your specific needs?`,
        createdAt: new Date(conversation.createdAt.getTime() + 2000)
      },
      {
        userId: project.userId,
        conversationId: conversation.id,
        projectId: project.id,
        role: 'user',
        content: 'I want more storage space and better lighting. What are my options?',
        createdAt: new Date(conversation.createdAt.getTime() + 3000)
      }
    ];
    
    for (const messageData of messages) {
      await prisma.chatMessage.create({
        data: messageData
      });
    }
    
    conversations.push({
      ...conversation,
      messageCount: messages.length
    });
    console.log(`  Created conversation for project: ${project.title} with ${messages.length} messages`);
  }
  
  // Create more extensive conversation for heavy user
  const mainProject = heavyProjects[0]; // Whole house renovation
  if (mainProject) {
    const conversation = await prisma.conversation.create({
      data: {
        userId: mainProject.userId,
        projectId: mainProject.id,
        title: 'Whole House Planning Discussion',
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    });
    
    const messages = [];
    const messageTemplates = [
      { role: 'user' as const, content: 'We\'re planning a whole house renovation and need guidance on where to start.' },
      { role: 'assistant' as const, content: 'A whole house renovation is exciting! I recommend starting with a clear vision and budget. Have you considered which areas are highest priority?' },
      { role: 'user' as const, content: 'The kitchen and master bathroom are our top priorities. We also want to open up the living area.' },
      { role: 'assistant' as const, content: 'Great priorities. For a whole house project, I suggest phasing: 1) Structural changes, 2) Kitchen/bathrooms, 3) Living areas, 4) Finishing touches. This helps manage budget and disruption.' },
      { role: 'user' as const, content: 'What about timeline? We\'d like to complete within 6 months if possible.' },
      { role: 'assistant' as const, content: 'A 6-month timeline is ambitious but possible with good planning. Key factors: contractor availability, material lead times, and permit approvals. I can help create a detailed timeline.' }
    ];
    
    let timestamp = conversation.createdAt.getTime();
    for (const template of messageTemplates) {
      timestamp += 1000 + Math.random() * 5000;
      messages.push({
        userId: mainProject.userId,
        conversationId: conversation.id,
        projectId: mainProject.id,
        role: template.role,
        content: template.content,
        createdAt: new Date(timestamp)
      });
    }
    
    for (const messageData of messages) {
      await prisma.chatMessage.create({
        data: messageData
      });
    }
    
    conversations.push({
      ...conversation,
      messageCount: messages.length
    });
    console.log(`  Created extensive conversation for whole house project with ${messages.length} messages`);
  }
  
  return conversations;
}

async function createUploadedFiles(users: any[], projects: any[]) {
  const standardUser = users.find(u => u.email === 'standard@example.com');
  const standardProject = projects.find(p => p.userId === standardUser.id && p.title.includes('Kitchen'));
  
  const files = [];
  
  if (standardProject) {
    const fileTypes = ['floor_plan', 'inspiration', 'quote', 'other'];
    
    for (let i = 0; i < 3; i++) {
      const fileType = fileTypes[i % fileTypes.length];
      const file = await prisma.uploadedFile.create({
        data: {
          userId: standardUser.id,
          projectId: standardProject.id,
          fileType: fileType as any,
          filePath: `/uploads/project-${standardProject.id}/file-${i+1}.${fileType === 'floor_plan' ? 'pdf' : 'jpg'}`,
          originalName: `${fileType.replace('_', ' ')}-${i+1}.${fileType === 'floor_plan' ? 'pdf' : 'jpg'}`,
          mimeType: fileType === 'floor_plan' ? 'application/pdf' : 'image/jpeg',
          sizeBytes: Math.floor(Math.random() * 5000000) + 100000, // 100KB-5MB
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      });
      files.push(file);
    }
    console.log(`  Created ${files.length} uploaded files for kitchen project`);
  }
  
  return files;
}

async function createCostEstimates(users: any[], projects: any[]) {
  const standardUser = users.find(u => u.email === 'standard@example.com');
  const heavyUser = users.find(u => u.email === 'heavy@example.com');
  const standardProject = projects.find(p => p.userId === standardUser.id && p.title.includes('Kitchen'));
  const heavyProject = projects.find(p => p.userId === heavyUser.id && p.title.includes('Whole House'));
  
  const estimates = [];
  
  // Kitchen estimate
  if (standardProject) {
    const estimate = await prisma.costEstimate.create({
      data: {
        userId: standardUser.id,
        projectId: standardProject.id,
        leanMin: 15000,
        leanMax: 25000,
        realisticMin: 25000,
        realisticMax: 40000,
        stretchMin: 40000,
        stretchMax: 70000,
        confidence: 'high',
        assumptions: 'Based on HDB kitchen of ~100 sqft. Includes: cabinets, countertops, appliances, plumbing, electrical, flooring.',
        costDrivers: '1. Material quality (cabinets, countertops)\n2. Appliance selection\n3. Custom features\n4. Contractor rates',
        estimatorInputs: JSON.stringify({
          projectType: 'kitchen',
          size: 100,
          quality: 'mid-range',
          location: 'Singapore',
          timestamp: new Date().toISOString()
        }),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    });
    estimates.push