import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { savedItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    console.log("🔍 Update lesson progress: Starting request...");
    
    const { userId } = await auth();
    console.log("🔍 Auth result:", { userId: userId ? "authenticated" : "not authenticated" });
    
    if (!userId) {
      console.log("❌ Update lesson progress: Unauthorized - No userId found");
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { saved_item_id, lesson_index, module_index, is_completed } = body;
    
    console.log("🔍 Request body:", { saved_item_id, lesson_index, module_index, is_completed });

    if (!saved_item_id || lesson_index === undefined || module_index === undefined || is_completed === undefined) {
      console.log("❌ Update lesson progress: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: saved_item_id, lesson_index, module_index, is_completed" },
        { status: 400 }
      );
    }

    // First, get the current saved item
    const currentItem = await db
      .select()
      .from(savedItems)
      .where(eq(savedItems.id, saved_item_id))
      .limit(1);

    if (!currentItem || currentItem.length === 0) {
      console.log("❌ Update lesson progress: Item not found", { saved_item_id });
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item = currentItem[0];

    // Verify the item belongs to the authenticated user
    if (item.clerkUserId !== userId) {
      console.log("❌ Update lesson progress: Access denied - Item belongs to different user", { 
        itemUserId: item.clerkUserId, 
        requestUserId: userId 
      });
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Parse the structured data to get lesson progress
    let structuredData = item.structured;
    let completedLessons = item.completedLessons || 0;
    let completedModules = item.completedModules || 0;
    let isCompleted = item.isCompleted || false;

    if (structuredData && structuredData.modules) {
      // Create a copy of the structured data to modify
      structuredData = JSON.parse(JSON.stringify(structuredData));
      
      // Find the specific lesson and update its completion status
      const module = structuredData.modules[module_index];
      if (module && module.lessons && module.lessons[lesson_index]) {
        module.lessons[lesson_index].is_completed = is_completed;
        
        // Recalculate progress
        let totalLessons = 0;
        let completedCount = 0;
        
        structuredData.modules.forEach(mod => {
          if (mod.lessons) {
            totalLessons += mod.lessons.length;
            completedCount += mod.lessons.filter(lesson => lesson.is_completed).length;
          }
        });
        
        completedLessons = completedCount;
        
        // Check if all modules are completed
        let moduleCompletionCount = 0;
        structuredData.modules.forEach(mod => {
          if (mod.lessons) {
            const moduleCompleted = mod.lessons.every(lesson => lesson.is_completed);
            if (moduleCompleted) moduleCompletionCount++;
          }
        });
        completedModules = moduleCompletionCount;
        
        // Check if course is completed
        isCompleted = totalLessons > 0 && completedCount === totalLessons;
        
        console.log("🔍 Progress updated:", { 
          totalLessons, 
          completedLessons, 
          completedModules, 
          isCompleted 
        });
      }
    }

    // Calculate progress percentage
    const progressPercentage = item.totalLessons > 0 
      ? Math.round((completedLessons / item.totalLessons) * 100) 
      : 0;

    // Update the database
    const [updatedItem] = await db
      .update(savedItems)
      .set({
        structured: structuredData,
        completedLessons,
        completedModules,
        isCompleted,
        progressPercentage,
      })
      .where(eq(savedItems.id, saved_item_id))
      .returning();

    console.log("✅ Update lesson progress: Success!", { 
      itemId: updatedItem.id,
      progressPercentage: updatedItem.progressPercentage,
      isCompleted: updatedItem.isCompleted
    });

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
      progressPercentage: updatedItem.progressPercentage,
      completedLessons: updatedItem.completedLessons,
      completedModules: updatedItem.completedModules,
      isCompleted: updatedItem.isCompleted,
    });

  } catch (error) {
    console.error("❌ Error updating lesson progress:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json(
      { 
        error: "Failed to update progress",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
