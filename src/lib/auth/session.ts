import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "./types";

/**
 * iron-sessionの設定
 */
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "oidc_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: "/",
  },
};

/**
 * セッションを取得するヘルパー関数
 */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * セッションからユーザー情報を取得
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email) {
    return null;
  }

  return {
    email: session.email,
    tenant: session.tenant,
  };
}

/**
 * セッションが有効かチェック
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return false;
  }

  // トークンの有効期限チェック
  if (session.expiresAt && Date.now() >= session.expiresAt) {
    // トークンが期限切れ
    return false;
  }

  return true;
}
