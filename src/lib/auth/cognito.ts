import * as client from "openid-client";
import { getCognitoConfig, getRedirectUrl } from "./config";
import type { TenantId } from "./types";

/**
 * テナント別のOIDC設定をキャッシュ
 */
const configCache = new Map<TenantId, client.Configuration>();

/**
 * テナント別のOIDC Configurationを取得（キャッシュあり）
 */
export async function getOIDCConfig(
  tenant: TenantId,
): Promise<client.Configuration> {
  // キャッシュから取得
  const cachedConfig = configCache.get(tenant);
  if (cachedConfig) {
    return cachedConfig;
  }

  const cognitoConfig = getCognitoConfig(tenant);

  // CognitoのIssuer URL
  const issuer = new URL(
    `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`,
  );

  try {
    // Authorization Server Metadataの取得
    const config = await client.discovery(
      issuer,
      cognitoConfig.clientId,
      cognitoConfig.clientSecret, // クライアントシークレット
    );

    // キャッシュに保存
    configCache.set(tenant, config);

    return config;
  } catch (error) {
    console.error(
      `Failed to discover OIDC configuration for ${tenant}:`,
      error,
    );
    throw new Error(
      `Failed to initialize OIDC client for ${tenant}. Please check your Cognito configuration.`,
    );
  }
}

/**
 * 認証URLを生成（PKCE + state対応）
 */
export async function buildAuthorizationUrl(tenant: TenantId) {
  const config = await getOIDCConfig(tenant);
  const redirectUri = getRedirectUrl(tenant);

  // PKCEパラメータの生成
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

  // CSRF対策用のstateパラメータ生成
  const state = client.randomState();

  // 認証URLの構築
  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: "openid email profile",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state: state,
  });

  return {
    authUrl: authUrl.href,
    codeVerifier,
    state,
  };
}

/**
 * 認証コードをトークンに交換
 */
export async function exchangeCodeForTokens(
  tenant: TenantId,
  currentUrl: string,
  codeVerifier: string,
  storedState: string,
) {
  const config = await getOIDCConfig(tenant);

  try {
    const tokens = await client.authorizationCodeGrant(
      config,
      new URL(currentUrl),
      {
        pkceCodeVerifier: codeVerifier,
        expectedState: storedState,
      },
    );

    return tokens;
  } catch (error) {
    console.error("Token exchange failed:", error);
    throw new Error("Failed to exchange authorization code for tokens");
  }
}

/**
 * IDトークンからユーザー情報を取得
 */
export async function getUserInfo(
  tenant: TenantId,
  accessToken: string,
): Promise<{ email?: string }> {
  const config = await getOIDCConfig(tenant);
  const userInfoEndpoint = config.serverMetadata().userinfo_endpoint;

  if (!userInfoEndpoint) {
    throw new Error("UserInfo endpoint not available");
  }

  try {
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`UserInfo request failed: ${response.statusText}`);
    }

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    throw error;
  }
}

/**
 * ログアウトURLを生成
 */
export function buildLogoutUrl(
  tenant: TenantId,
  logoutRedirectUri: string,
): string {
  const cognitoConfig = getCognitoConfig(tenant);

  // CognitoのログアウトエンドポイントURL
  const logoutUrl = new URL(`${cognitoConfig.domain}/logout`);
  logoutUrl.searchParams.set("client_id", cognitoConfig.clientId);
  logoutUrl.searchParams.set("logout_uri", logoutRedirectUri);

  return logoutUrl.href;
}
