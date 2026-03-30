import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  try {
    console.log("🔍 Creating database tables...");
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not found");
    }

    const sql = neon(databaseUrl);
    
    // Create the tables using the generated migration SQL
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

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "course_progress_saved_item_id_idx" ON "course_progress" USING btree ("saved_item_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "course_progress_lesson_module_idx" ON "course_progress" USING btree ("lesson_index","module_index");`;
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_clerk_user_id_idx" ON "saved_items" USING btree ("clerk_user_id");`;
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_kind_idx" ON "saved_items" USING btree ("kind");`;
    await sql`CREATE INDEX IF NOT EXISTS "saved_items_created_at_idx" ON "saved_items" USING btree ("created_at");`;
    
    console.log("✅ Database tables created successfully!");
    
    return NextResponse.json({
      success: true,
      message: "Database tables created successfully!"
    });
    
  } catch (error) {
    console.error("❌ Failed to create tables:", error);
    return NextResponse.json(
      { 
        error: "Failed to create database tables",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
