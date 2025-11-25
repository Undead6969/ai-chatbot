import { tool } from "ai";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

/**
 * File system tool for reading and writing files
 * REQUIRES APPROVAL for safety
 */
export const fileSystemTool = tool({
  description:
    "Read or write files on the filesystem. Use this tool to read existing files, create new files, or modify existing files. WARNING: This tool requires approval before execution.",
  inputSchema: z.object({
    operation: z
      .enum(["read", "write", "list"])
      .describe("The operation to perform: read, write, or list files"),
    path: z
      .string()
      .describe(
        "The file path (relative to workspace root or absolute). For list operations, this is the directory path."
      ),
    content: z
      .string()
      .optional()
      .describe("File content (required for write operations)"),
  }),
  needsApproval: true, // Always require approval for file operations
  execute: async ({ operation, path: filePath, content }) => {
    try {
      // Security: Only allow operations within workspace
      const workspaceRoot = process.cwd();
      const resolvedPath = path.resolve(workspaceRoot, filePath);

      // Ensure the resolved path is within workspace
      if (!resolvedPath.startsWith(workspaceRoot)) {
        return {
          error: "Access denied: Path must be within workspace",
        };
      }

      switch (operation) {
        case "read": {
          const fileContent = await fs.readFile(resolvedPath, "utf-8");
          return {
            operation: "read",
            path: filePath,
            content: fileContent,
            success: true,
          };
        }

        case "write": {
          if (!content) {
            return {
              error: "Content is required for write operations",
            };
          }
          await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
          await fs.writeFile(resolvedPath, content, "utf-8");
          return {
            operation: "write",
            path: filePath,
            success: true,
            message: "File written successfully",
          };
        }

        case "list": {
          const entries = await fs.readdir(resolvedPath, {
            withFileTypes: true,
          });
          const files = entries.map((entry) => ({
            name: entry.name,
            type: entry.isDirectory() ? "directory" : "file",
          }));
          return {
            operation: "list",
            path: filePath,
            files,
            success: true,
          };
        }

        default:
          return {
            error: `Unknown operation: ${operation}`,
          };
      }
    } catch (error) {
      return {
        error: `File operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

