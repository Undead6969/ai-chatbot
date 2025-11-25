"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ToolConfig } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const TOOLS = [
  { id: "search", name: "Web Search", description: "Search the web for information" },
  { id: "filesystem", name: "File System", description: "Read and write files" },
  { id: "codeExecution", name: "Code Execution", description: "Execute code in sandbox" },
  { id: "analysis", name: "Data Analysis", description: "Analyze data and generate insights" },
] as const;

const PROVIDERS = [
  { id: "openai", name: "OpenAI", description: "GPT-4o, GPT-4o Mini" },
  { id: "anthropic", name: "Anthropic", description: "Claude Opus 4, Sonnet 4, Haiku" },
  { id: "google", name: "Google Gemini", description: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash" },
  { id: "mistral", name: "Mistral", description: "Mistral Large, Medium" },
] as const;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [toolConfigs, setToolConfigs] = useState<ToolConfig[]>([]);
  const [apiKeyConfigs, setApiKeyConfigs] = useState<Array<{ provider: string; apiKey: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingApiKey, setSavingApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadToolConfigs();
      loadApiKeyConfigs();
    }
  }, [status, router]);

  const loadToolConfigs = async () => {
    try {
      const response = await fetch("/api/admin/tools");
      if (response.ok) {
        const data = await response.json();
        setToolConfigs(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to load tool configs:", response.statusText);
        setToolConfigs([]);
      }
    } catch (error) {
      console.error("Failed to load tool configs:", error);
      setToolConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeyConfigs = async () => {
    try {
      const response = await fetch("/api/admin/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeyConfigs(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to load API key configs:", response.statusText);
        setApiKeyConfigs([]);
      }
    } catch (error) {
      console.error("Failed to load API key configs:", error);
      setApiKeyConfigs([]);
    }
  };

  const updateApiKey = async (provider: string, apiKey: string, isActive: boolean) => {
    try {
      setSavingApiKey(provider);
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, isActive }),
      });

      if (response.ok) {
        await loadApiKeyConfigs();
        // Show success message
        alert(`API key for ${provider} saved successfully! Models will be available after server restart.`);
      } else {
        const error = await response.json();
        alert(`Failed to save API key: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      alert("Failed to save API key");
    } finally {
      setSavingApiKey(null);
    }
  };

  const getApiKeyConfig = (provider: string) => {
    return apiKeyConfigs.find((config) => config.provider === provider);
  };

  const getToolConfig = (toolId: string): ToolConfig | undefined => {
    return toolConfigs.find((config) => config.toolId === toolId);
  };

  const updateToolConfig = async (
    toolId: string,
    updates: { enabled?: boolean; needsApproval?: boolean; config?: Record<string, unknown> }
  ) => {
    try {
      setSaving(toolId);
      const response = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, ...updates }),
      });

      if (response.ok) {
        await loadToolConfigs();
      } else {
        console.error("Failed to update tool config");
      }
    } catch (error) {
      console.error("Error updating tool config:", error);
    } finally {
      setSaving(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lea Agent Configuration</h1>
        <p className="text-muted-foreground">
          Configure API keys for AI providers and manage Lea's tools.
        </p>
      </div>

      {/* API Keys Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add API keys to enable models from different providers. Keys are stored securely in the database.
        </p>
        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const config = getApiKeyConfig(provider.id);
            const hasKey = config && config.apiKey && config.apiKey.length > 8;

            return (
              <Card key={provider.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {provider.description}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`${provider.id}-api-key`}>
                          API Key {hasKey && <span className="text-green-600">(configured)</span>}
                        </Label>
                        <Input
                          id={`${provider.id}-api-key`}
                          type="password"
                          placeholder={hasKey ? "••••••••••••" : `Enter ${provider.name} API key`}
                          defaultValue=""
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              updateApiKey(provider.id, e.target.value.trim(), true);
                            }
                          }}
                          disabled={savingApiKey === provider.id}
                          className="mt-2"
                        />
                        {hasKey && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Key is configured. Enter a new key to update it.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {savingApiKey === provider.id && (
                    <div className="text-sm text-muted-foreground">
                      Saving...
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Tools Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tool Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure which tools Lea can use and their approval requirements.
        </p>
        <div className="space-y-4">
          {TOOLS.map((tool) => {
            const config = getToolConfig(tool.id);
            const enabled = config?.enabled ?? true;
            const needsApproval = config?.needsApproval ?? false;

            return (
              <Card key={tool.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {tool.description}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`${tool.id}-enabled`}
                          checked={enabled}
                          onChange={(e) =>
                            updateToolConfig(tool.id, { enabled: e.target.checked })
                          }
                          disabled={saving === tool.id}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`${tool.id}-enabled`}>
                          Enable {tool.name}
                        </Label>
                      </div>

                      {enabled && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${tool.id}-approval`}
                            checked={needsApproval}
                            onChange={(e) =>
                              updateToolConfig(tool.id, {
                                needsApproval: e.target.checked,
                              })
                            }
                            disabled={saving === tool.id}
                            className="w-4 h-4"
                          />
                          <Label htmlFor={`${tool.id}-approval`}>
                            Require approval before execution
                          </Label>
                        </div>
                      )}

                      {tool.id === "search" && enabled && (
                        <div className="mt-4 space-y-2">
                          <Label htmlFor={`${tool.id}-api-key`}>
                            Search API Key (optional)
                          </Label>
                          <Input
                            id={`${tool.id}-api-key`}
                            type="password"
                            placeholder="Enter API key for search provider"
                            defaultValue={
                              (config?.config as Record<string, string>)
                                ?.apiKey || ""
                            }
                            onBlur={(e) => {
                              if (e.target.value) {
                                updateToolConfig(tool.id, {
                                  config: { apiKey: e.target.value },
                                });
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Configure API keys for Tavily, Exa, or other search
                            providers
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {saving === tool.id && (
                    <div className="text-sm text-muted-foreground">
                      Saving...
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">About Configuration</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            API keys are stored securely in the database and loaded on server startup
          </li>
          <li>
            Enabled tools are available to Lea for autonomous task execution
          </li>
          <li>
            Tools with approval required will prompt users before execution
          </li>
          <li>
            File System and Code Execution tools always require approval for
            security
          </li>
          <li>Changes take effect immediately for new conversations</li>
        </ul>
      </div>
    </div>
  );
}

