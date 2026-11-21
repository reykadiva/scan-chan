import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('--- Checking Supabase Cloud Database ---');

  // Count DB records
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const scanCount = await prisma.scanHistory.count();
  const petCount = await prisma.pet.count();
  const progressCount = await prisma.progress.count();
  const missionCount = await prisma.mission.count();
  const achievementCount = await prisma.achievement.count();

  console.log('Existing DB records:', {
    userCount,
    productCount,
    scanCount,
    petCount,
    progressCount,
    missionCount,
    achievementCount,
  });

  // Clean DB if anything remains
  if (scanCount > 0) await prisma.scanHistory.deleteMany();
  if (productCount > 0) await prisma.product.deleteMany();
  if (userCount > 0) await prisma.user.deleteMany();

  // Check Supabase Auth Users
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersData, error: authListError } = await adminSupabase.auth.admin.listUsers();
  if (authListError) {
    console.error('Error listing auth users:', authListError);
  } else {
    console.log(`Found ${usersData.users.length} user(s) in Supabase Auth`);
    for (const u of usersData.users) {
      console.log(`Deleting test user from Auth: ${u.email} (${u.id})`);
      await adminSupabase.auth.admin.deleteUser(u.id);
    }
  }

  // Final verification
  const finalUsers = await prisma.user.count();
  const finalProducts = await prisma.product.count();
  const finalScans = await prisma.scanHistory.count();
  const finalPets = await prisma.pet.count();
  const finalProgress = await prisma.progress.count();
  const { data: finalAuth } = await adminSupabase.auth.admin.listUsers();

  console.log('--- Final Cloud Status ---');
  console.log({
    finalDatabaseUsers: finalUsers,
    finalDatabaseProducts: finalProducts,
    finalDatabaseScans: finalScans,
    finalDatabasePets: finalPets,
    finalDatabaseProgress: finalProgress,
    finalAuthUsers: finalAuth?.users.length ?? 0,
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
