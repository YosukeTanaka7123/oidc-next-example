import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/lib/auth/cognito";
import { getSession } from "@/lib/auth/session";
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

    // 認証URLを生成（PKCE + state対応）
    const { authUrl, codeVerifier, state } =
      await buildAuthorizationUrl(tenant);

    // code_verifierとstateをセッションに保存
    const session = await getSession();
    session.codeVerifier = codeVerifier;
    session.state = state;
    session.tenant = tenant;
    await session.save();

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
