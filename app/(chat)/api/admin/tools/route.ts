import { auth } from "@/app/(auth)/auth";
import { getAllToolConfigs, upsertToolConfig } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add proper admin role check
    // For now, allow any authenticated user

    try {
      const configs = await getAllToolConfigs();
      return NextResponse.json(configs);
    } catch (dbError) {
      // If database is not available, return empty array
      console.warn("Database not available, returning empty tool configs:", dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching tool configs:", error);
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

    // TODO: Add proper admin role check

    const body = await request.json();
    const { toolId, enabled, needsApproval, config } = body;

    if (!toolId) {
      return NextResponse.json(
        { error: "toolId is required" },
        { status: 400 }
      );
    }

    try {
      await upsertToolConfig({
        toolId,
        enabled: enabled ?? true,
        needsApproval,
        config,
      });

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error("Database error updating tool config:", dbError);
      // Return success even if DB fails - config will use defaults
      return NextResponse.json({ success: true, warning: "Database unavailable, using defaults" });
    }
  } catch (error) {
    console.error("Error updating tool config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

