"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut, Key, Wrench, Settings, CheckCircle2, XCircle } from "lucide-react";
import type { ToolConfig } from "@/lib/db/schema";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LoginDialog } from "@/components/login-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TOOLS = [
  { id: "search", name: "Web Search", description: "Search the web for information", icon: "🔍" },
  { id: "filesystem", name: "File System", description: "Read and write files", icon: "📁" },
  { id: "codeExecution", name: "Code Execution", description: "Execute code in sandbox", icon: "💻" },
  { id: "analysis", name: "Data Analysis", description: "Analyze data and generate insights", icon: "📊" },
  { id: "browserAction", name: "Browser Actions", description: "Guided browser actions (placeholder)", icon: "🌐" },
  { id: "shellTask", name: "Shell Tasks", description: "Sandboxed shell tasks (approval required)", icon: "🖥️" },
  { id: "adapterCall", name: "Adapters", description: "MCP-style external app adapters", icon: "🧩" },
  { id: "browserUseTask", name: "Browser Use Cloud", description: "Chromium automation via Browser Use Cloud", icon: "🛰️" },
] as const;

const PROVIDERS = [
  { id: "openai", name: "OpenAI", description: "GPT-4o, GPT-4o Mini", icon: "🤖" },
  { id: "anthropic", name: "Anthropic", description: "Claude Opus 4, Sonnet 4, Haiku", icon: "🧠" },
  { id: "google", name: "Google Gemini", description: "Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash", icon: "💎" },
  { id: "mistral", name: "Mistral", description: "Mistral Large, Medium", icon: "🌊" },
] as const;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [toolConfigs, setToolConfigs] = useState<ToolConfig[]>([]);
  const [apiKeyConfigs, setApiKeyConfigs] = useState<Array<{ provider: string; apiKey: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingApiKey, setSavingApiKey] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowLoginDialog(true);
      return;
    }

    if (status === "authenticated") {
      setShowLoginDialog(false);
      loadToolConfigs();
      loadApiKeyConfigs();
    }
  }, [status]);

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

  const enabledToolsCount = TOOLS.filter((tool) => {
    const config = getToolConfig(tool.id);
    return config?.enabled ?? true;
  }).length;

  const configuredApiKeysCount = PROVIDERS.filter((provider) => {
    const config = getApiKeyConfig(provider.id);
    return config && config.apiKey && config.apiKey.length > 8;
  }).length;

  return (
    <>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {!session ? (
                <Card className="mx-4 lg:mx-6">
                  <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>
                      Please sign in to access the admin panel.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowLoginDialog(true)}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Stats Overview */}
                  <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enabled Tools</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{enabledToolsCount}</div>
                        <p className="text-xs text-muted-foreground">
                          of {TOOLS.length} tools active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{configuredApiKeysCount}</div>
                        <p className="text-xs text-muted-foreground">
                          of {PROVIDERS.length} providers configured
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tools Requiring Approval</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {toolConfigs.filter((c) => c.needsApproval).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tools with approval enabled
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">
                          Lea agent is operational
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Configuration */}
                  <Tabs defaultValue="api-keys" className="px-4 lg:px-6">
                    <TabsList>
                      <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                      <TabsTrigger value="tools">Tools</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="api-keys" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>API Key Configuration</CardTitle>
                          <CardDescription>
                            Add API keys to enable models from different providers. Keys are stored securely in the database.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {PROVIDERS.map((provider) => {
                            const config = getApiKeyConfig(provider.id);
                            const hasKey = config && config.apiKey && config.apiKey.length > 8;

                            return (
                              <Card key={provider.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{provider.icon}</span>
                                      <div>
                                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                          {provider.description}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    {hasKey && (
                                      <Badge variant="default" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Configured
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <Label htmlFor={`${provider.id}-api-key`}>
                                      API Key
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
                                    />
                                    {hasKey && (
                                      <p className="text-xs text-muted-foreground">
                                        Key is configured. Enter a new key to update it.
                                      </p>
                                    )}
                                    {savingApiKey === provider.id && (
                                      <p className="text-xs text-muted-foreground">Saving...</p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="tools" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Tool Configuration</CardTitle>
                          <CardDescription>
                            Configure which tools Lea can use and their approval requirements.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {TOOLS.map((tool) => {
                            const config = getToolConfig(tool.id);
                            const enabled = config?.enabled ?? true;
                            const needsApproval = config?.needsApproval ?? false;

                            return (
                              <Card key={tool.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">{tool.icon}</span>
                                      <div>
                                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                                        <CardDescription className="text-xs">
                                          {tool.description}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {enabled ? (
                                        <Badge variant="default" className="gap-1">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Enabled
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="gap-1">
                                          <XCircle className="h-3 w-3" />
                                          Disabled
                                        </Badge>
                                      )}
                                      {needsApproval && (
                                        <Badge variant="outline">Requires Approval</Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`${tool.id}-enabled`}
                                      checked={enabled}
                                      onChange={(e) =>
                                        updateToolConfig(tool.id, { enabled: e.target.checked })
                                      }
                                      disabled={saving === tool.id}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor={`${tool.id}-enabled`} className="cursor-pointer">
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
                                        className="w-4 h-4 rounded border-gray-300"
                                      />
                                      <Label htmlFor={`${tool.id}-approval`} className="cursor-pointer">
                                        Require approval before execution
                                      </Label>
                                    </div>
                                  )}

                                  {tool.id === "search" && enabled && (
                                    <div className="space-y-2 pt-2 border-t">
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
                                        Configure API keys for Tavily, Exa, or other search providers
                                      </p>
                                    </div>
                                  )}

                                  {saving === tool.id && (
                                    <p className="text-xs text-muted-foreground">Saving...</p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>About Configuration</CardTitle>
                          <CardDescription>
                            Information about how the configuration system works
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
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
                              File System and Code Execution tools always require approval for security
                            </li>
                            <li>Changes take effect immediately for new conversations</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
