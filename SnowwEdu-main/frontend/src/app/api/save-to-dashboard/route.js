import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    console.log("🔍 Save to dashboard: Starting request...");
    
    const { userId } = await auth();
    console.log("🔍 Auth result:", { userId: userId ? "authenticated" : "not authenticated" });
    
    if (!userId) {
      console.log("❌ Save to dashboard: Unauthorized - No userId found");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("🔍 Request body:", { kind: body.kind, topic: body.topic, hasStructured: !!body.structured });
    
    const { kind, topic, structured, raw } = body;

    if (!kind || !topic || !structured) {
      console.log("❌ Save to dashboard: Missing fields", { kind, topic, hasStructured: !!structured });
      return NextResponse.json(
        { error: "Missing required fields: kind, topic, structured" },
        { status: 400 }
      );
    }

    if (!['course', 'roadmap'].includes(kind)) {
      console.log("❌ Save to dashboard: Invalid kind", { kind });
      return NextResponse.json(
        { error: "Invalid kind. Must be 'course' or 'roadmap'" },
        { status: 400 }
      );
    }

    console.log("🔍 Database check: Starting database operations...");
    
    // Calculate total lessons and modules for courses
    let totalLessons = 0;
    let totalModules = 0;
    
    if (kind === 'course' && structured.modules) {
      totalModules = structured.modules.length;
      totalLessons = structured.modules.reduce((total, module) => {
        return total + (module.lessons ? module.lessons.length : 0);
      }, 0);
      console.log("🔍 Course stats:", { totalModules, totalLessons });
    }

    // Check if item already exists for this user and topic
    console.log("🔍 Checking for existing items...");
    const existingItem = await db
      .select()
      .from(savedItems)
      .where(eq(savedItems.clerkUserId, userId))
      .then(items => {
        console.log(`🔍 Found ${items.length} items for user ${userId}`);
        return items.find(item => item.topic === topic && item.kind === kind);
      });

    if (existingItem) {
      console.log("❌ Save to dashboard: Item already exists", { existingItemId: existingItem.id, topic, kind });
      return NextResponse.json(
        { 
          error: "Item already exists",
          message: `You already have a ${kind} for "${topic}" in your dashboard`,
          existingItem: {
            id: existingItem.id,
            topic: existingItem.topic,
            kind: existingItem.kind,
            createdAt: existingItem.createdAt
          }
        },
        { status: 409 }
      );
    }

    console.log("🔍 Inserting new item...");
    // Insert new item
    const [newItem] = await db.insert(savedItems).values({
      clerkUserId: userId,
      kind,
      topic,
      structured,
      raw,
      totalLessons,
      totalModules,
      progressPercentage: 0,
      isCompleted: false,
      completedLessons: 0,
      completedModules: 0,
    }).returning();

    console.log("✅ Save to dashboard: Success!", { newItemId: newItem.id });

    return NextResponse.json({
      success: true,
      message: `${kind.charAt(0).toUpperCase() + kind.slice(1)} saved to dashboard successfully!`,
      item: {
        id: newItem.id,
        topic: newItem.topic,
        kind: newItem.kind,
        totalLessons: newItem.totalLessons,
        totalModules: newItem.totalModules,
        createdAt: newItem.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Error saving to dashboard:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json(
      { 
        error: "Failed to save to dashboard",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
