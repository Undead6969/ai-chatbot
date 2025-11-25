import { auth } from "@/app/(auth)/auth";
import { getAllApiKeyConfigs, upsertApiKeyConfig } from "@/lib/db/queries";
import { updateApiKeyCache } from "@/lib/ai/providers";
import { NextResponse } from "next/server";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", envVar: "OPENAI_API_KEY" },
  { id: "anthropic", name: "Anthropic", envVar: "ANTHROPIC_API_KEY" },
  { id: "google", name: "Google Gemini", envVar: "GOOGLE_GENERATIVE_AI_API_KEY" },
  { id: "mistral", name: "Mistral", envVar: "MISTRAL_API_KEY" },
] as const;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const configs = await getAllApiKeyConfigs();
      // Return configs with masked keys for security
      const maskedConfigs = configs.map((config) => ({
        ...config,
        apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : "",
      }));
      return NextResponse.json(maskedConfigs);
    } catch (dbError) {
      console.warn("Database not available, returning empty API key configs:", dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching API key configs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { provider, apiKey, isActive } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "provider and apiKey are required" },
        { status: 400 }
      );
    }

    // Validate provider
    if (!PROVIDERS.find((p) => p.id === provider)) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    try {
      await upsertApiKeyConfig({
        provider,
        apiKey,
        isActive: isActive ?? true,
      });

      // Update cache and environment variable for immediate use
      updateApiKeyCache(provider, apiKey);

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error updating API key config:", dbError);
      // Still update cache even if DB fails
      updateApiKeyCache(provider, apiKey);
      return NextResponse.json({ 
        success: true, 
        warning: "Database unavailable, key stored in memory only" 
      });
    }
  } catch (error) {
    console.error("Error updating API key config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

