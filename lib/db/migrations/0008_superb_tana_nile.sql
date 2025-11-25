CREATE TABLE IF NOT EXISTS "ToolConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"toolId" varchar(64) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"needsApproval" boolean DEFAULT false NOT NULL,
	"config" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ToolConfig_toolId_unique" UNIQUE("toolId")
);
