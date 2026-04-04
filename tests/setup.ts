// Test setup file
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Ensure database is clean for tests
  if (process.env.NODE_ENV === 'test') {
    // In test environment, we might want to use a test database
    console.log('Test environment detected');
  }
});

// Global test teardown
afterAll(async () => {
  await prisma.$disconnect();
});

// Test utilities
export const testUtils = {
  async createTestUser(email: string) {
    const { hash } = await import('bcryptjs');
    return prisma.user.create({
      data: {
        email,
        name: 'Test User',
        passwordHash: await hash('Test123!', 12),
        role: 'user',
        status: 'active',
        emailVerified: new Date()
      }
    });
  },

  async cleanupTestUser(email: string) {
    await prisma.user.deleteMany({ where: { email } });
  },

  async getTableCount(tableName: string) {
    const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return parseInt((result as any)[0].count);
  }
};