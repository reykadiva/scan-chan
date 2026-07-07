import { prisma } from '../src/lib/prisma';

async function checkAllUsers() {
  try {
    console.log('🔍 Checking ALL users in database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        mode: true,
        avatar: true,
      },
    });
    
    console.log(`Found ${users.length} total users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Nickname: ${user.nickname}`);
      console.log(`   Mode: ${user.mode || 'NULL'}`);
      console.log(`   Avatar: ${user.avatar}`);
      console.log('');
    });
    
    // Check for duplicate (mode, nickname) combinations
    const combos = users.map(u => `${u.mode}:${u.nickname}`);
    const duplicates = combos.filter((item, index) => combos.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      console.log('⚠️  DUPLICATES FOUND:');
      duplicates.forEach(dup => console.log(`   - ${dup}`));
    } else {
      console.log('✅ No duplicate (mode, nickname) combinations found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
