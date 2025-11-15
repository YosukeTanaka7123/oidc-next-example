/**
 * セッションに保存するユーザーデータの型定義
 */
export interface SessionData {
  /** ユーザーのメールアドレス */
  email?: string;
  /** アクセストークン */
  accessToken?: string;
  /** リフレッシュトークン（オプション） */
  refreshToken?: string;
  /** IDトークン */
  idToken?: string;
  /** トークンの有効期限（Unix timestamp） */
  expiresAt?: number;
  /** ユーザーが属するテナント（tenant-a または tenant-b） */
  tenant?: string;
  /** PKCEコードベリファイア（認証フロー中のみ使用） */
  codeVerifier?: string;
  /** CSRF対策用のstateパラメータ（認証フロー中のみ使用） */
  state?: string;
  /** ユーザーがログイン済みかどうか */
  isLoggedIn: boolean;
}

/**
 * Cognitoから取得したユーザー情報の型定義
 */
export interface UserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}

/**
 * 許可されているテナント名
 */
export type TenantId = "tenant-a" | "tenant-b";

/**
 * テナントIDの検証
 */
export function isValidTenant(tenant: string): tenant is TenantId {
  return tenant === "tenant-a" || tenant === "tenant-b";
}
