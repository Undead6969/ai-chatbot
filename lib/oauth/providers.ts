import { generateUUID } from "@/lib/utils";

export type OAuthProviderConfig = {
  id: string;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  redirectPath: string;
  tokenRequestFormat: "json" | "form";
  tokenAuthStyle?: "basic" | "body";
  extraAuthorizeParams?: Record<string, string>;
};

const providers: OAuthProviderConfig[] = [
  {
    id: "github",
    name: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["repo", "read:user"],
    clientIdEnv: "GITHUB_OAUTH_CLIENT_ID",
    clientSecretEnv: "GITHUB_OAUTH_CLIENT_SECRET",
    redirectPath: "/api/oauth/github/callback",
    tokenRequestFormat: "json",
  },
  {
    id: "notion",
    name: "Notion",
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scopes: ["connections.search"],
    clientIdEnv: "NOTION_CLIENT_ID",
    clientSecretEnv: "NOTION_CLIENT_SECRET",
    redirectPath: "/api/oauth/notion/callback",
    tokenRequestFormat: "json",
    tokenAuthStyle: "basic",
    extraAuthorizeParams: { owner: "user" },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    clientIdEnv: "GOOGLE_DRIVE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_DRIVE_CLIENT_SECRET",
    redirectPath: "/api/oauth/google-drive/callback",
    tokenRequestFormat: "form",
  },
  {
    id: "figma",
    name: "Figma",
    authorizeUrl: "https://www.figma.com/oauth",
    tokenUrl: "https://www.figma.com/api/oauth/token",
    scopes: ["files:read"],
    clientIdEnv: "FIGMA_CLIENT_ID",
    clientSecretEnv: "FIGMA_CLIENT_SECRET",
    redirectPath: "/api/oauth/figma/callback",
    tokenRequestFormat: "form",
  },
  {
    id: "vercel",
    name: "Vercel",
    authorizeUrl: "https://vercel.com/oauth/authorize",
    tokenUrl: "https://api.vercel.com/v2/oauth/access_token",
    scopes: ["read", "write", "deployments.read"],
    clientIdEnv: "VERCEL_OAUTH_CLIENT_ID",
    clientSecretEnv: "VERCEL_OAUTH_CLIENT_SECRET",
    redirectPath: "/api/oauth/vercel/callback",
    tokenRequestFormat: "form",
  },
  {
    id: "canva",
    name: "Canva",
    authorizeUrl: "https://www.canva.com/api/oauth/authorize",
    tokenUrl: "https://www.canva.com/api/oauth/token",
    scopes: ["content:create"],
    clientIdEnv: "CANVA_CLIENT_ID",
    clientSecretEnv: "CANVA_CLIENT_SECRET",
    redirectPath: "/api/oauth/canva/callback",
    tokenRequestFormat: "form",
  },
];

export function getOAuthProviderConfig(providerId: string): OAuthProviderConfig | undefined {
  return providers.find((p) => p.id === providerId);
}

export function buildState() {
  return generateUUID();
}

export function buildRedirectUri(origin: string, redirectPath: string) {
  return `${origin.replace(/\/$/, "")}${redirectPath}`;
}

