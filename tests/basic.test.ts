// Basic Test Suite
// Run with: npx jest tests/basic.test.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

describe('Basic System Tests', () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Database Connection', () => {
    test('should connect to database', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toBeDefined();
    });

    test('should have required tables', async () => {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      const tableNames = (tables as any[]).map(t => t.table_name);
      expect(tableNames).toContain('User');
      expect(tableNames).toContain('Project');
      expect(tableNames).toContain('Conversation');
    });
  });

  describe('User Model', () => {
    test('should create and retrieve user', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Test User',
          passwordHash: await hash('Test123!', 12),
          role: 'user',
          status: 'active',
          emailVerified: new Date()
        }
      });

      expect(user.email).toBe(testEmail);
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    test('should enforce unique email', async () => {
      const testEmail = `unique-${Date.now()}@example.com`;
      
      await prisma.user.create({
        data: {
          email: testEmail,
          name: 'User 1',
          passwordHash: await hash('Test123!', 12),
          role: 'user',
          status: 'active'
        }
      });

      // Try to create duplicate
      await expect(
        prisma.user.create({
          data: {
            email: testEmail,
            name: 'User 2',
            passwordHash: await hash('Test123!', 12),
            role: 'user',
            status: 'active'
          }
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.user.deleteMany({ where: { email: testEmail } });
    });
  });

  describe('Project Ownership', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `project-test-${Date.now()}@example.com`,
          name: 'Project Test User',
          passwordHash: await hash('Test123!', 12),
          role: 'user',
          status: 'active'
        }
      });
    });

    afterEach(async () => {
      await prisma.user.delete({ where: { id: testUser.id } });
    });

    test('should create project with user ownership', async () => {
      const project = await prisma.project.create({
        data: {
          userId: testUser.id,
          title: 'Test Project',
          propertyType: 'apartment',
          roomCount: 2,
          budget: 30000,
          status: 'active'
        }
      });

      expect(project.userId).toBe(testUser.id);
      expect(project.title).toBe('Test Project');

      // Verify ownership query works
      const userProjects = await prisma.project.findMany({
        where: { userId: testUser.id }
      });

      expect(userProjects).toHaveLength(1);
      expect(userProjects[0].id).toBe(project.id);
    });

    test('should cascade delete user projects', async () => {
      // Create multiple projects
      await prisma.project.createMany({
        data: [
          {
            userId: testUser.id,
            title: 'Project 1',
            propertyType: 'apartment',
            roomCount: 1,
            budget: 20000,
            status: 'active'
          },
          {
            userId: testUser.id,
            title: 'Project 2',
            propertyType: 'house',
            roomCount: 3,
            budget: 50000,
            status: 'active'
          }
        ]
      });

      // Verify projects exist
      const projectsBefore = await prisma.project.count({
        where: { userId: testUser.id }
      });
      expect(projectsBefore).toBe(2);

      // Delete user (should cascade delete projects)
      await prisma.user.delete({ where: { id: testUser.id } });

      // Verify projects are deleted
      const projectsAfter = await prisma.project.count({
        where: { userId: testUser.id }
      });
      expect(projectsAfter).toBe(0);
    });
  });

  describe('VerificationToken Model', () => {
    test('should have primary key constraint', async () => {
      // This test verifies the fix for Prisma Studio issue
      const constraints = await prisma.$queryRaw`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = 'VerificationToken'::regclass 
        AND contype = 'p'
      `;

      expect(constraints).toHaveLength(1);
      expect((constraints as any[])[0].contype).toBe('p');
    });

    test('should enforce unique token', async () => {
      const tokenData = {
        identifier: 'test@example.com',
        token: `unique-token-${Date.now()}`,
        expires: new Date(Date.now() + 3600000) // 1 hour from now
      };

      await prisma.verificationToken.create({
        data: tokenData
      });

      // Try to create duplicate token
      await expect(
        prisma.verificationToken.create({
          data: {
            identifier: 'other@example.com',
            token: tokenData.token, // Same token
            expires: new Date(Date.now() + 7200000)
          }
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.verificationToken.deleteMany({
        where: { token: tokenData.token }
      });
    });
  });

  describe('Count Queries', () => {
    test('all models should support count()', async () => {
      // This test ensures Prisma Studio count query issue is fixed
      const models = [
        'user',
        'project',
        'conversation',
        'chatMessage',
        'verificationToken',
        'costEstimate',
        'contractorQuote',
        'quoteLineItem',
        'uploadedFile',
        'job',
        'costEvent',
        'userActivity'
      ];

      for (const model of models) {
        try {
          const count = await prisma[model].count();
          expect(typeof count).toBe('number');
          console.log(`✅ ${model}.count() works: ${count} records`);
        } catch (error) {
          // If any model fails count(), the test fails
          throw new Error(`${model}.count() failed: ${error.message}`);
        }
      }
    });
  });
});