import type { TenantId } from "./types";

/**
 * Cognitoの設定情報
 */
export interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  region: string;
}

/**
 * 環境変数からテナント別のCognito設定を取得
 */
export function getCognitoConfig(tenant: TenantId): CognitoConfig {
  const tenantKey = tenant === "tenant-a" ? "A" : "B";

  const userPoolId = process.env[`COGNITO_USER_POOL_ID_${tenantKey}`];
  const clientId = process.env[`COGNITO_CLIENT_ID_${tenantKey}`];
  const clientSecret = process.env[`COGNITO_CLIENT_SECRET_${tenantKey}`];
  const domain = process.env[`COGNITO_DOMAIN_${tenantKey}`];
  const region = process.env[`COGNITO_REGION_${tenantKey}`];

  if (!userPoolId || !clientId || !clientSecret || !domain || !region) {
    throw new Error(
      `Missing Cognito configuration for tenant: ${tenant}. Please check your environment variables.`,
    );
  }

  return {
    userPoolId,
    clientId,
    clientSecret,
    domain,
    region,
  };
}

/**
 * アプリケーションのベースURL
 */
export function getAppUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/**
 * テナント別のコールバックURLを取得
 */
export function getRedirectUrl(tenant: TenantId): string {
  return `${getAppUrl()}/${tenant}/api/auth/callback`;
}

/**
 * テナント別のログアウト後のリダイレクトURLを取得
 */
export function getLogoutRedirectUrl(): string {
  return `${getAppUrl()}`;
}
