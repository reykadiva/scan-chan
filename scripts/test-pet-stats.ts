/**
 * Direct database test script to verify pet stats persistence
 * Run with: npx tsx scripts/test-pet-stats.ts
 */

import 'dotenv/config';
import { createPrismaClient } from '../src/lib/database/create-prisma-client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment!');
  process.exit(1);
}

const prisma = createPrismaClient(process.env.DATABASE_URL, 'legacy');

async function testPetStatsPersistence() {
  console.log('🧪 Testing Pet Stats Direct Database Access\n');
  
  try {
    // 1. Find an existing Arashu user or use your user ID
    console.log('1️⃣ Finding Arashu users...');
    const users = await prisma.user.findMany({
      where: { mode: 'ARASHU' },
      include: {
        pet: {
          include: { stats: true },
        },
      },
      take: 1,
    });
    
    if (users.length === 0) {
      console.log('❌ No Arashu users found in database!');
      return;
    }
    
    const user = users[0];
    console.log(`✅ Found user: ${user.nickname} (${user.id})`);
    console.log(`   Current stats:`, {
      hunger: user.pet?.stats?.hunger,
      affection: user.pet?.stats?.affection,
      stage: user.pet?.stage,
    });
    
    // 2. Update stats directly
    console.log('\n2️⃣ Updating stats directly in database...');
    const testHunger = 85;
    const testAffection = 45;
    
    await prisma.petStats.update({
      where: { petId: user.pet!.id },
      data: {
        hunger: testHunger,
        affection: testAffection,
      },
    });
    
    console.log(`✅ Updated to hunger=${testHunger}, affection=${testAffection}`);
    
    // 3. Read back immediately
    console.log('\n3️⃣ Reading back from database...');
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pet: {
          include: { stats: true },
        },
      },
    });
    
    console.log(`📖 Fresh read:`, {
      hunger: freshUser?.pet?.stats?.hunger,
      affection: freshUser?.pet?.stats?.affection,
      stage: freshUser?.pet?.stage,
    });
    
    // 4. Verify values match
    console.log('\n4️⃣ Verification:');
    if (freshUser?.pet?.stats?.hunger === testHunger && 
        freshUser?.pet?.stats?.affection === testAffection) {
      console.log('✅ SUCCESS! Database writes are persisting correctly!');
    } else {
      console.log('❌ FAILED! Values do not match:');
      console.log(`   Expected: hunger=${testHunger}, affection=${testAffection}`);
      console.log(`   Got: hunger=${freshUser?.pet?.stats?.hunger}, affection=${freshUser?.pet?.stats?.affection}`);
    }
    
    // 5. Test upsert pattern (like API does)
    console.log('\n5️⃣ Testing upsert pattern (like API route)...');
    const testHunger2 = 92;
    const testAffection2 = 67;
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pet: {
          update: {
            stats: {
              update: {
                hunger: testHunger2,
                affection: testAffection2,
              },
            },
          },
        },
      },
    });
    
    const afterUpsert = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pet: { include: { stats: true } },
      },
    });
    
    console.log(`📖 After upsert:`, {
      hunger: afterUpsert?.pet?.stats?.hunger,
      affection: afterUpsert?.pet?.stats?.affection,
    });
    
    if (afterUpsert?.pet?.stats?.hunger === testHunger2 && 
        afterUpsert?.pet?.stats?.affection === testAffection2) {
      console.log('✅ SUCCESS! Upsert pattern works correctly!');
    } else {
      console.log('❌ FAILED! Upsert values do not match!');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPetStatsPersistence();
