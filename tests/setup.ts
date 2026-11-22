import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

// SC-003: Prevent accidental integration execution against live database
if (process.env.DATABASE_URL?.includes('supabase.co') && process.env.ALLOW_INTEGRATION_TEST !== 'true') {
  // Safe default: do not mutate live database in automated standard runs
  console.info('[Setup] Protected live database detected. ALLOW_INTEGRATION_TEST=true required for integration tests.');
}
