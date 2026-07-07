/**
 * Check Dzahar user status in database
 */

import 'dotenv/config';
import { createPrismaClient } from '../src/lib/database/create-prisma-client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const prisma = createPrismaClient(process.env.DATABASE_URL, 'legacy');

async function checkDzaharUser() {
  console.log('🔍 Checking Dzahar user in database...\n');
  
  try {
    // Find user by email through Supabase auth
    // We need to search by user ID - let's find all users first
    const allUsers = await prisma.user.findMany({
      include: {
        pet: {
          include: { stats: true },
        },
        progress: true,
        settings: true,
        inventory: true,
      },
    });
    
    console.log(`Found ${allUsers.length} total users in database\n`);
    
    for (const user of allUsers) {
      console.log('─'.repeat(70));
      console.log(`User ID: ${user.id}`);
      console.log(`Nickname: ${user.nickname}`);
      console.log(`Mode: ${user.mode}`);
      console.log(`\nPet Info:`);
      if (user.pet) {
        console.log(`  Name: ${user.pet.name}`);
        console.log(`  Stage: ${user.pet.stage}`);
        console.log(`  Stats: ${user.pet.stats ? 'EXISTS' : '❌ MISSING'}`);
        if (user.pet.stats) {
          console.log(`    Hunger: ${user.pet.stats.hunger}`);
          console.log(`    Affection: ${user.pet.stats.affection}`);
        }
      } else {
        console.log(`  ❌ NO PET RECORD`);
      }
      
      console.log(`\nProgress: ${user.progress ? 'EXISTS' : '❌ MISSING'}`);
      if (user.progress) {
        console.log(`  XP: ${user.progress.xp}`);
        console.log(`  Level: ${user.progress.level}`);
      }
      
      console.log(`\nSettings: ${user.settings ? 'EXISTS' : '❌ MISSING'}`);
      console.log(`Inventory: ${user.inventory ? 'EXISTS' : '❌ MISSING'}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('Summary:');
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Users with pets: ${allUsers.filter(u => u.pet).length}`);
    console.log(`Users with pet stats: ${allUsers.filter(u => u.pet?.stats).length}`);
    console.log(`Users missing pet stats: ${allUsers.filter(u => u.pet && !u.pet.stats).length}`);
    
    const brokenUsers = allUsers.filter(u => u.pet && !u.pet.stats);
    if (brokenUsers.length > 0) {
      console.log('\n⚠️  BROKEN USERS (have pet but no stats):');
      brokenUsers.forEach(u => {
        console.log(`  - ${u.nickname} (${u.id})`);
      });
      
      console.log('\n🔧 Fixing broken users...');
      for (const user of brokenUsers) {
        await prisma.petStats.create({
          data: {
            petId: user.pet!.id,
            hunger: 50,
            affection: 10,
          },
        });
        console.log(`  ✅ Created stats for ${user.nickname}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDzaharUser();
