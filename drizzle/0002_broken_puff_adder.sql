ALTER TABLE "collection_verses" ALTER COLUMN "verse_key" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "collection_verses" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_verses" ADD COLUMN "notes" varchar(500);--> statement-breakpoint
ALTER TABLE "collection_verses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_verses" DROP COLUMN "added_at";--> statement-breakpoint
ALTER TABLE "collection_verses" ADD CONSTRAINT "collection_verses_collection_id_verse_key_unique" UNIQUE("collection_id","verse_key");