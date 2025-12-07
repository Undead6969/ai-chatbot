import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  buildRedirectUri,
  getOAuthProviderConfig,
} from "@/lib/oauth/providers";
import { upsertApiKeyConfig } from "@/lib/db/queries";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

async function exchangeCodeForToken({
  config,
  code,
  redirectUri,
}: {
  config: ReturnType<typeof getOAuthProviderConfig>;
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  if (!config) throw new Error("Invalid provider");

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) {
    throw new Error(`Missing credentials for ${config.id}`);
  }

  const commonPayload = {
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
  };

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (config.tokenAuthStyle === "basic") {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers.Authorization = `Basic ${basic}`;
  }

  const body =
    config.tokenRequestFormat === "json"
      ? JSON.stringify(commonPayload)
      : new URLSearchParams(commonPayload as Record<string, string>).toString();

  if (config.tokenRequestFormat === "form") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as TokenResponse;
  if (!data.access_token) {
    throw new Error("No access token returned");
  }
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const providerId = params.provider;
  const config = getOAuthProviderConfig(providerId);
  if (!config) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(`oauth_state_${providerId}`)?.value;
  if (storedState && state && storedState !== state) {
    return NextResponse.json({ error: "State mismatch" }, { status: 400 });
  }

  const origin = request.headers.get("origin") || process.env.APP_ORIGIN || "http://localhost:3000";
  const redirectUri = buildRedirectUri(origin, config.redirectPath);

  try {
    const tokenData = await exchangeCodeForToken({ config, code, redirectUri });
    const payload = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
    };

    await upsertApiKeyConfig({
      provider: `adapter-${providerId}`,
      apiKey: JSON.stringify(payload),
      isActive: true,
    });

    const redirectTarget = new URL(`/admin?provider=${providerId}&connected=1`, origin);
    const response = NextResponse.redirect(redirectTarget.toString(), { status: 302 });
    response.cookies.delete(`oauth_state_${providerId}`);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token exchange failed" },
      { status: 500 },
    );
  }
}

