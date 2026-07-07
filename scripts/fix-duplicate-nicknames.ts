import { prisma } from '../src/lib/prisma';

async function fixDuplicateNicknames() {
  try {
    console.log('🔍 Checking for users with duplicate nicknames in ARASHU mode...');
    
    // Find all ARASHU users
    const users = await prisma.user.findMany({
      where: {
        mode: 'ARASHU',
      },
      select: {
        id: true,
        nickname: true,
        mode: true,
      },
    });
    
    console.log(`Found ${users.length} ARASHU users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id.substring(0, 8)}... | Nickname: ${user.nickname} | Mode: ${user.mode}`);
    });
    
    // Check if there are users with "Arashu" nickname
    const arashuUsers = users.filter(u => u.nickname === 'Arashu');
    
    if (arashuUsers.length > 0) {
      console.log(`\n⚠️  Found ${arashuUsers.length} user(s) with hardcoded "Arashu" nickname`);
      console.log('We need to update these to use unique nicknames based on their user IDs');
      
      // Option 1: Delete all users and let them re-register
      // Option 2: Update nicknames to be unique
      
      console.log('\n🗑️  Deleting users with "Arashu" nickname to allow fresh registration...');
      
      for (const user of arashuUsers) {
        console.log(`   Deleting user ${user.id.substring(0, 8)}...`);
        await prisma.user.delete({
          where: { id: user.id },
        });
      }
      
      console.log('✅ Cleanup complete! Users can now register with unique nicknames.');
    } else {
      console.log('\n✅ No duplicate nicknames found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateNicknames();
