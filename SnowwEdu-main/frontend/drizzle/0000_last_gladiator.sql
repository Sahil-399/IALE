CREATE TABLE "course_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saved_item_id" uuid NOT NULL,
	"lesson_index" integer NOT NULL,
	"module_index" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_items" (
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
--> statement-breakpoint
CREATE INDEX "course_progress_saved_item_id_idx" ON "course_progress" USING btree ("saved_item_id");--> statement-breakpoint
CREATE INDEX "course_progress_lesson_module_idx" ON "course_progress" USING btree ("lesson_index","module_index");--> statement-breakpoint
CREATE INDEX "saved_items_clerk_user_id_idx" ON "saved_items" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "saved_items_kind_idx" ON "saved_items" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "saved_items_created_at_idx" ON "saved_items" USING btree ("created_at");