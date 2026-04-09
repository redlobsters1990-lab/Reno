import { PrismaClient } from "@prisma/client";
import { STATIC_PRICES } from "@/server/services/market-price";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Updating market prices to Singapore 2025–2026 rates...");
  
  // Delete all existing market prices
  const deleteCount = await prisma.marketPrice.deleteMany({});
  console.log(`🗑️  Deleted ${deleteCount.count} old records`);
  
  // Insert new records from STATIC_PRICES
  const data = STATIC_PRICES.map(p => ({
    category: p.category,
    material: p.material,
    unit: p.unit,
    thickness: p.thickness || null,
    height: p.height || null,
    lowPrice: p.lowPrice,
    highPrice: p.highPrice,
    source: p.source,
    updatedAt: p.updatedAt,
    createdAt: new Date(),
  }));
  
  await prisma.marketPrice.createMany({ data });
  console.log(`✅ Inserted ${data.length} updated market price records`);
  
  // Verify
  const count = await prisma.marketPrice.count();
  console.log(`📈 Total market prices in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating market prices:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });