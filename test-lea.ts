/**
 * Simple test script for Lea Agent
 * Run with: pnpm tsx test-lea.ts
 */

import { getLeaAgent } from "./lib/ai/agent/lea";

async function testLeaAgent() {
  console.log("🤖 Testing Lea Agent...\n");

  try {
    // Create the agent
    console.log("1. Creating Lea agent...");
    const agent = await getLeaAgent();
    console.log("✅ Agent created successfully\n");

    // Test a simple prompt
    console.log("2. Testing agent with a simple prompt...");
    console.log("   Prompt: 'What tools do you have available?'\n");

    const result = await agent.generate({
      prompt: "What tools do you have available?",
    });

    console.log("✅ Agent response received:");
    console.log("   Text:", result.text);
    console.log("\n   Steps:", result.steps?.length || 0);
    
    if (result.steps && result.steps.length > 0) {
      console.log("\n   Tool calls:");
      result.steps.forEach((step, i) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          step.toolCalls.forEach((call) => {
            console.log(`     - Step ${i + 1}: ${call.toolName}`);
          });
        }
      });
    }

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

testLeaAgent();

