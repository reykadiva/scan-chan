import { prisma } from '../src/lib/prisma';

async function deleteOldUser() {
  try {
    console.log('🗑️  Deleting old user with nickname "Arashu" and mode "GUEST"...\n');
    
    const user = await prisma.user.findFirst({
      where: {
        nickname: 'Arashu',
        mode: 'GUEST',
      },
    });
    
    if (!user) {
      console.log('✅ No user found with those credentials');
      return;
    }
    
    console.log(`Found user: ${user.id}`);
    console.log(`  Nickname: ${user.nickname}`);
    console.log(`  Mode: ${user.mode}`);
    console.log('');
    
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    console.log('✅ User deleted successfully!');
    console.log('Users can now re-register with unique nicknames.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldUser();
