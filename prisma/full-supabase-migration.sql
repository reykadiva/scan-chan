-- ============================================================
-- Scan-Chan Complete Supabase Database Migration & RLS Setup
-- ============================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "AppMode" AS ENUM ('GUEST', 'ARASHU');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "PetStage" AS ENUM ('KITTEN', 'YOUNG_CAT', 'ADULT_CAT', 'WISE_CAT', 'LEGENDARY_CAT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "MissionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "InventoryItemType" AS ENUM ('PRODUCT', 'FOOD', 'MEMORY', 'FURNITURE', 'DECORATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "mode" "AppMode" NOT NULL DEFAULT 'GUEST',
    "nickname" VARCHAR(80),
    "avatar" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL DEFAULT 'Scan-chan Jr.',
    "stage" "PetStage" NOT NULL DEFAULT 'KITTEN',
    "mood" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pets_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "pet_stats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "pet_id" TEXT NOT NULL,
    "hunger" INTEGER NOT NULL DEFAULT 50,
    "affection" INTEGER NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pet_stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pet_stats_pet_id_key" UNIQUE ("pet_id"),
    CONSTRAINT "pet_stats_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "inventories" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventories_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "inventories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "inventory_items" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "inventory_id" TEXT NOT NULL,
    "type" "InventoryItemType" NOT NULL,
    "item_key" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_items_inventory_id_type_item_key_key" UNIQUE ("inventory_id", "type", "item_key"),
    CONSTRAINT "inventory_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "barcode_number" VARCHAR(20) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255),
    "category" VARCHAR(255),
    "description" TEXT,
    "image_url" TEXT,
    "creator_id" VARCHAR(255),
    "food_value" INTEGER,
    "rarity" VARCHAR(80),
    "pet_reaction" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_barcode_number_key" UNIQUE ("barcode_number")
);

CREATE TABLE IF NOT EXISTS "scan_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT,
    "barcode_number" VARCHAR(20) NOT NULL,
    "product_id" TEXT,
    "device_type" VARCHAR(100),
    "xp_awarded" INTEGER,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "scan_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "scan_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "progress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "progress_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "sound" BOOLEAN NOT NULL DEFAULT true,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "motion" BOOLEAN NOT NULL DEFAULT true,
    "theme" VARCHAR(80) NOT NULL DEFAULT 'default',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "settings_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "missions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "template_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "status" "MissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "xp_reward" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "missions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "missions_user_id_template_id_date_key" UNIQUE ("user_id", "template_id", "date"),
    CONSTRAINT "missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(120),
    "threshold" INTEGER,
    "xp_reward" INTEGER,
    "badge_image" TEXT,
    "unlocked_at" TIMESTAMP(3),
    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "sync_metadata" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "source" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_metadata_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sync_metadata_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "sync_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS "users_mode_idx" ON "users"("mode");
CREATE INDEX IF NOT EXISTS "inventory_items_type_idx" ON "inventory_items"("type");
CREATE INDEX IF NOT EXISTS "products_barcode_number_idx" ON "products"("barcode_number");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category");
CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products"("created_at");
CREATE INDEX IF NOT EXISTS "scan_logs_barcode_number_idx" ON "scan_logs"("barcode_number");
CREATE INDEX IF NOT EXISTS "scan_logs_scanned_at_idx" ON "scan_logs"("scanned_at");
CREATE INDEX IF NOT EXISTS "scan_logs_user_id_idx" ON "scan_logs"("user_id");

-- 4. Enable Row Level Security (RLS)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pet_stats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scan_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "missions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_metadata" ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Products: Read by all, insert/update by authenticated or service role
DO $$ BEGIN
    CREATE POLICY "Products are viewable by everyone" ON "products" FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Products can be inserted by authenticated users" ON "products" FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Products can be updated by creators" ON "products" FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users: Users can read and update their own record
DO $$ BEGIN
    CREATE POLICY "Users can manage own record" ON "users" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Pets & Pet Stats: Users can manage their own pet
DO $$ BEGIN
    CREATE POLICY "Users can manage own pet" ON "pets" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own pet stats" ON "pet_stats" FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM "pets" WHERE "pets"."id" = "pet_stats"."pet_id" AND "pets"."user_id" = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Inventories & Inventory Items: Users can manage their own inventory
DO $$ BEGIN
    CREATE POLICY "Users can manage own inventory" ON "inventories" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own inventory items" ON "inventory_items" FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM "inventories" WHERE "inventories"."id" = "inventory_items"."inventory_id" AND "inventories"."user_id" = auth.uid()::text));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Progress & Settings: Users can manage their own
DO $$ BEGIN
    CREATE POLICY "Users can manage own progress" ON "progress" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can manage own settings" ON "settings" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Scan Logs: Users can view and insert their own scan logs
DO $$ BEGIN
    CREATE POLICY "Users can manage own scan logs" ON "scan_logs" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id OR user_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sync Metadata: Users can manage their own
DO $$ BEGIN
    CREATE POLICY "Users can manage own sync metadata" ON "sync_metadata" FOR ALL USING (auth.role() = 'service_role' OR auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
