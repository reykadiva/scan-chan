import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in .env.local');
  }

  console.log('🚀 Connecting to Supabase PostgreSQL...');
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('🧹 1. Resetting public schema cleanly...');
    await client.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;

      -- Standard Supabase permissions
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO anon;
      GRANT ALL ON SCHEMA public TO authenticated;
      GRANT ALL ON SCHEMA public TO service_role;

      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
    `);
    console.log('✅ Public schema reset & permissions granted.');

    console.log('📦 2. Applying full-supabase-migration.sql...');
    const migrationSqlPath = path.resolve(process.cwd(), 'prisma/full-supabase-migration.sql');
    const sql = fs.readFileSync(migrationSqlPath, 'utf-8');

    await client.query(sql);
    console.log('✅ Migration applied successfully!');

    console.log('🔍 3. Verifying created tables and RLS in Supabase...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${tablesRes.rows.length} tables in public schema:`);
    tablesRes.rows.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.table_name}`);
    });

    const rlsRes = await client.query(`
      SELECT relname as table_name, relrowsecurity as rls_enabled
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE pg_namespace.nspname = 'public' AND relkind = 'r'
      ORDER BY relname;
    `);

    console.log('🛡️ Row Level Security (RLS) Status:');
    rlsRes.rows.forEach((r) => {
      console.log(`   - ${r.table_name}: ${r.rls_enabled ? 'ENABLED ✅' : 'DISABLED ❌'}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('🎉 Supabase Clean Migration Complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration error:', err);
    process.exit(1);
  });
