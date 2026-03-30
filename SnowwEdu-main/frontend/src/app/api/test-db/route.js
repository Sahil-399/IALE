import { NextResponse } from "next/server";
import { db } from "@/db";
import { savedItems } from "@/db/schema";

export async function GET() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Test basic database connection
    const result = await db.select().from(savedItems).limit(1);
    
    console.log("✅ Database connection successful!");
    console.log(`🔍 Found ${result.length} items in database`);
    
    return NextResponse.json({
      success: true,
      message: "Database connection working!",
      itemCount: result.length
    });
    
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return NextResponse.json(
      { 
        error: "Database connection failed",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
