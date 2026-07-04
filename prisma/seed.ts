import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Seed achievements
  // ponytail: seed file uses old schema; skip achievement seeding until Sprint 5.5 UI needs it
  console.log('Skipping achievement seed (schema updated for Sprint 5.2)');


  // Seed sample products
  const sampleProducts = [
    {
      barcodeNumber: '8996001600267',
      productName: 'Chitato Lite BBQ',
      brand: 'Indofood',
      category: 'Snack',
      description: 'Crispy potato chips with BBQ flavour, reduced fat version.',
      imageUrl: null,
    },
    {
      barcodeNumber: '8886470100018',
      productName: 'Pocari Sweat',
      brand: 'Otsuka',
      category: 'Drink',
      description: 'Ion supply drink that quickly replenishes lost fluids and ions.',
      imageUrl: null,
    },
    {
      barcodeNumber: '8999999012345',
      productName: 'Tango Wafer Coklat',
      brand: 'Garudafood',
      category: 'Biscuit',
      description: 'Crispy chocolate wafer filled with creamy chocolate cream.',
      imageUrl: null,
    },
    {
      barcodeNumber: '8886998001024',
      productName: 'Milo Activ-Go',
      brand: 'Nestle',
      category: 'Drink',
      description: 'Chocolate malt drink with ACTIV-GO energy mix.',
      imageUrl: null,
    },
    {
      barcodeNumber: '8992775614150',
      productName: 'Indomie Goreng Original',
      brand: 'Indofood',
      category: 'Instant',
      description: 'Indonesian original fried noodles, the most popular instant noodle in Indonesia.',
      imageUrl: null,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { barcodeNumber: product.barcodeNumber },
      update: product,
      create: product,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
