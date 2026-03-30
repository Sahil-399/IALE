const { neon } = require("@neondatabase/serverless");

async function setupDatabase() {
  try {
    console.log("🔍 Connecting to Neon database...");
    
    const databaseUrl = "postgresql://neondb_owner:npg_3YEGmyP4IZDR@ep-little-tree-a14ljzza-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found");
    }

    const sql = neon(databaseUrl);
    
    console.log("🔍 Creating saved_items table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "saved_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "clerk_user_id" text NOT NULL,
        "kind" text NOT NULL,
        "topic" text NOT NULL,
        "structured" jsonb,
        "raw" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "is_completed" boolean DEFAULT false,
        "completed_lessons" integer DEFAULT 0,
        "total_lessons" integer DEFAULT 0,
        "completed_modules" integer DEFAULT 0,
        "total_modules" integer DEFAULT 0,
        "progress_percentage" integer DEFAULT 0,
        "last_accessed_at" timestamp with time zone
      );
    `;

    console.log("🔍 Creating course_progress table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "course_progress" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "saved_item_id" uuid NOT NULL,
        "lesson_index" integer NOT NULL,
        "module_index" integer NOT NULL,
        "is_completed" boolean DEFAULT false,
        "completed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    console.log("🔍 Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_clerk_user_id_idx" ON "saved_items" USING btree ("clerk_user_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_kind_idx" ON "saved_items" USING btree ("kind");`;
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_created_at_idx" ON "saved_items" USING btree ("created_at");`;
    await sql`CREATE INDEX IF NOT EXISTS "course_progress_saved_item_id_idx" ON "course_progress" USING btree ("saved_item_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "course_progress_lesson_module_idx" ON "course_progress" USING btree ("lesson_index","module_index");`;
    
    console.log("✅ Database tables created successfully!");
    
    // Test the connection
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("🔍 Tables in database:", result.map(row => row.table_name));
    
  } catch (error) {
    console.error("❌ Failed to create tables:", error);
  }
}

setupDatabase();
