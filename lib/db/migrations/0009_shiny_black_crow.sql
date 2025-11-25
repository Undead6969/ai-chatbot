CREATE TABLE IF NOT EXISTS "ApiKeyConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(64) NOT NULL,
	"apiKey" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ApiKeyConfig_provider_unique" UNIQUE("provider")
);
