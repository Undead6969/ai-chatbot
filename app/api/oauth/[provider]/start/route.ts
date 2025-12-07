import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  buildRedirectUri,
  buildState,
  getOAuthProviderConfig,
} from "@/lib/oauth/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const providerId = params.provider;
  const config = getOAuthProviderConfig(providerId);
  if (!config) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: `Missing client credentials for ${providerId}. Set ${config.clientIdEnv} and ${config.clientSecretEnv}.`,
      },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin") || process.env.APP_ORIGIN || "http://localhost:3000";
  const redirectUri = buildRedirectUri(origin, config.redirectPath);
  const state = buildState();

  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scopes.join(" "));
  url.searchParams.set("state", state);
  if (config.extraAuthorizeParams) {
    for (const [key, value] of Object.entries(config.extraAuthorizeParams)) {
      url.searchParams.set(key, value);
    }
  }

  const response = NextResponse.redirect(url.toString(), { status: 302 });
  response.cookies.set(`oauth_state_${providerId}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}

