import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request) {
  try {
    console.log("🔍 Get saved item: Starting request...");
    
    const { userId } = await auth();
    console.log("🔍 Auth result:", { userId: userId ? "authenticated" : "not authenticated" });
    
    if (!userId) {
      console.log("❌ Get saved item: Unauthorized - No userId found");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      console.log("❌ Get saved item: Missing ID parameter");
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching saved item:", { id, userId });

    const item = await db
      .select()
      .from(savedItems)
      .where(eq(savedItems.id, id))
      .limit(1);

    if (!item || item.length === 0) {
      console.log("❌ Get saved item: Item not found", { id });
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const savedItem = item[0];

    // Verify the item belongs to the authenticated user
    if (savedItem.clerkUserId !== userId) {
      console.log("❌ Get saved item: Access denied - Item belongs to different user", { 
        itemUserId: savedItem.clerkUserId, 
        requestUserId: userId 
      });
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    console.log("✅ Get saved item: Success!", { 
      id: savedItem.id, 
      topic: savedItem.topic, 
      kind: savedItem.kind 
    });

    return NextResponse.json({
      success: true,
      item: {
        id: savedItem.id,
        topic: savedItem.topic,
        kind: savedItem.kind,
        structured: savedItem.structured,
        raw: savedItem.raw,
        totalLessons: savedItem.totalLessons,
        totalModules: savedItem.totalModules,
        progressPercentage: savedItem.progressPercentage,
        isCompleted: savedItem.isCompleted,
        completedLessons: savedItem.completedLessons,
        completedModules: savedItem.completedModules,
        createdAt: savedItem.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Error getting saved item:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json(
      { 
        error: "Failed to get saved item",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
