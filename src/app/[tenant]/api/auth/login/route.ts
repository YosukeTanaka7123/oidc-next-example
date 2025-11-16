import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/auth/cognito";
import { cleanupExpiredAuthStates, createAuthState } from "@/lib/auth/session";
import { isValidTenant } from "@/lib/auth/types";

/**
 * ログインエンドポイント
 * Cognitoの認証ページにリダイレクトし、PKCE + state flowを開始する
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ tenant: string }> },
) {
  try {
    const { tenant } = await context.params;

    // テナントIDの検証
    if (!isValidTenant(tenant)) {
      return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
    }

    // Clean up expired auth states (non-blocking)
    cleanupExpiredAuthStates().catch(console.error);

    // 認証URLを生成（PKCE + state対応）
    const { authUrl, codeVerifier, state } =
      await buildAuthorizationUrl(tenant);

    // code_verifierとstateをAuthStateに保存
    await createAuthState({
      codeVerifier,
      state,
      tenant,
    });

    // Cognitoの認証ページにリダイレクト
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to initiate login" },
      { status: 500 },
    );
  }
}
