import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { MarketPriceService } from "@/server/services/market-price";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");
  await MarketPriceService.seedIfEmpty();

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      passwordHash: await hash("password123", 12),
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Create a sample project for the test user
  const project = await prisma.project.create({
    data: {
      userId: testUser.id,
      title: "Sample HDB Renovation",
      propertyType: "HDB BTO",
      roomCount: 3,
      budget: 50000,
      stylePreference: "Modern Minimalist",
      notes: "This is a sample project for testing purposes.",
    },
  });

  console.log(`✅ Created sample project: ${project.title}`);

  // Create sample memories
  await prisma.userLongTermMemory.create({
    data: {
      userId: testUser.id,
      memoryKey: "style_preference",
      memoryValue: "Prefers modern minimalist design with clean lines",
      confidence: 0.8,
      source: "seed",
    },
  });

  await prisma.projectShortTermMemory.create({
    data: {
      userId: testUser.id,
      projectId: project.id,
      memoryType: "design_assumption",
      note: "Assuming open concept kitchen layout",
      status: "active",
    },
  });

  console.log("✅ Created sample memories");

  // Create sample chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: testUser.id,
        projectId: project.id,
        role: "user",
        content: "Hi, I need help planning my HDB renovation.",
      },
      {
        userId: testUser.id,
        projectId: project.id,
        role: "assistant",
        content: "Hello! I'd be happy to help you plan your HDB renovation. What specific areas are you looking to renovate?",
      },
    ],
  });

  console.log("✅ Created sample chat messages");

  // Create sample estimate
  await prisma.costEstimate.create({
    data: {
      projectId: project.id,
      leanMin: 35000,
      leanMax: 45000,
      realisticMin: 45000,
      realisticMax: 60000,
      stretchMin: 60000,
      stretchMax: 75000,
      confidence: "medium",
      assumptions: "Property type: HDB BTO\nStyle tier: standard\nKitchen redo: Yes\nBathrooms: 2\nCarpentry level: medium\nElectrical scope: moderate\nPainting: Yes\nAssumed area: 90 sqm",
      costDrivers: "Kitchen renovation, 2 bathrooms, custom carpentry",
      estimatorInputs: JSON.stringify({
        propertyType: "HDB BTO",
        styleTier: "standard",
        kitchenRedo: true,
        bathroomCount: 2,
        carpentryLevel: "medium",
        electricalScope: "moderate",
        painting: true,
      }),
    },
  });

  console.log("✅ Created sample cost estimate");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
