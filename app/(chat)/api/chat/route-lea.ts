/**
 * Alternative route implementation using Lea Agent (AI SDK 6)
 * This can be integrated into the main route.ts file
 */

import { createAgentUIStreamResponse } from "ai";
import { auth } from "@/app/(auth)/auth";
import { getLeaAgent } from "@/lib/ai/agent/lea";
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

/**
 * Convert custom ChatMessage format to standard UIMessage format for agent
 */
function convertToAgentMessages(
  messages: ChatMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages.map((msg) => {
    const textParts = msg.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { type: "text"; text: string }).text)
      .join("");

    return {
      role: msg.role as "user" | "assistant",
      content: textParts,
    };
  });
}

export async function POST_LEA(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedVisibilityType: "public" | "private";
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const chat = await getChatById({ id });
    let messagesFromDb: any[] = [];

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      messagesFromDb = await getMessagesByChatId({ id });
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    }

    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    // Save user message
    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    // Get Lea agent
    const agent = await getLeaAgent();

    // Convert messages to agent format
    const agentMessages = convertToAgentMessages(uiMessages);

    // Use createAgentUIStreamResponse from AI SDK 6
    return createAgentUIStreamResponse({
      agent,
      messages: agentMessages,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unhandled error in Lea chat API:", error);
    return new ChatSDKError("offline:chat").toResponse();
  }
}

