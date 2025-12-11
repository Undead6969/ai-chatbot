import type { InferSelectModel } from "drizzle-orm";
import {
  bigint,
  boolean,
  foreignKey,
  integer,
  json,
  jsonb,
  numeric,
  pgTable,
  serial,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const toolConfig = pgTable("ToolConfig", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  toolId: varchar("toolId", { length: 64 }).notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  needsApproval: boolean("needsApproval").notNull().default(false),
  config: jsonb("config").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const apiKeyConfig = pgTable("ApiKeyConfig", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  provider: varchar("provider", { length: 64 }).notNull().unique(),
  apiKey: text("apiKey").notNull(), // In production, this should be encrypted
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type ApiKeyConfig = InferSelectModel<typeof apiKeyConfig>;

// Lemon AI tables (ported schema)
export const lemonAgents = pgTable("lemon_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  name: text("name").notNull().default(""),
  describe: text("describe").notNull(),
  mcpServerIds: jsonb("mcp_server_ids"),
  isPublic: boolean("is_public").notNull().default(true),
  directReferenceCount: integer("direct_reference_count")
    .notNull()
    .default(0),
  autoReferenceCount: integer("auto_reference_count")
    .notNull()
    .default(0),
  totalReferenceCount: integer("total_reference_count")
    .notNull()
    .default(0),
  knowledgeCount: integer("knowledge_count").notNull().default(0),
  experienceIterationCount: integer("experience_iteration_count")
    .notNull()
    .default(0),
  screenShotUrl: text("screen_shot_url"),
  sourceAgentIds: jsonb("source_agent_ids").default([]),
  replayConversationId: text("replay_conversation_id"),
  recommend: integer("recommend").default(0),
  deletedAt: timestamp("deleted_at"),
  createAt: timestamp("create_at").notNull().defaultNow(),
  updateAt: timestamp("update_at").notNull().defaultNow(),
});

export type LemonAgent = InferSelectModel<typeof lemonAgents>;

export const lemonConversations = pgTable("lemon_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  agentId: integer("agent_id"),
  modeType: text("mode_type").notNull().default("task"),
  conversationId: text("conversation_id").notNull(),
  selectedRepository: text("selected_repository"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  usagePoint: numeric("usage_point", { precision: 14, scale: 4 })
    .notNull()
    .default("0"),
  createAt: timestamp("create_at").notNull().defaultNow(),
  updateAt: timestamp("update_at").notNull().defaultNow(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  status: text("status").notNull().default("done"),
  isFromSubServer: boolean("is_from_sub_server").notNull().default(false),
  modelId: integer("model_id"),
  docsetId: text("docset_id"),
  twinsId: text("twins_id"),
});

export type LemonConversation = InferSelectModel<typeof lemonConversations>;

export const lemonMessages = pgTable("lemon_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }),
  role: text("role").notNull(),
  uuid: text("uuid"),
  conversationId: text("conversation_id").notNull(),
  status: text("status").notNull(),
  content: text("content").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  meta: jsonb("meta").notNull().default({}),
  comments: text("comments"),
  memorized: text("memorized"),
  createAt: timestamp("create_at").notNull().defaultNow(),
  updateAt: timestamp("update_at").notNull().defaultNow(),
});

export type LemonMessage = InferSelectModel<typeof lemonMessages>;

export const lemonTasks = pgTable("lemon_tasks", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" }),
  conversationId: text("conversation_id").notNull(),
  taskId: text("task_id").notNull(),
  parentId: text("parent_id"),
  requirement: text("requirement").notNull(),
  status: text("status").notNull(),
  error: text("error"),
  result: text("result"),
  memorized: text("memorized"),
  createAt: timestamp("create_at").notNull().defaultNow(),
  updateAt: timestamp("update_at").notNull().defaultNow(),
});

export type LemonTask = InferSelectModel<typeof lemonTasks>;
