import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/auth/cognito";
import {
  deleteAuthState,
  getAuthState,
  upsertSession,
} from "@/lib/auth/session";
import { isValidTenant } from "@/lib/auth/types";

/**
 * OIDCコールバックエンドポイント
 * stateパラメータを検証し、認証コードをトークンに交換してセッションを確立する
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenant: string }> },
) {
  try {
    const { tenant } = await context.params;

    // テナントIDの検証
    if (!isValidTenant(tenant)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // AuthStateからcode_verifierとstateを取得
    const authState = await getAuthState(tenant);

    if (!authState) {
      console.error("No auth state found");
      return NextResponse.redirect(new URL(`/${tenant}`, request.url));
    }

    // Tenant mismatch check
    if (authState.tenant !== tenant) {
      console.error("Tenant mismatch in auth state");
      return NextResponse.redirect(new URL(`/${tenant}`, request.url));
    }

    const codeVerifier = authState.codeVerifier;
    const storedState = authState.state;

    if (!codeVerifier) {
      console.error("Missing code_verifier in auth state");
      return NextResponse.redirect(new URL(`/${tenant}`, request.url));
    }

    // CSRF対策: stateパラメータの検証
    const url = new URL(request.url);
    const returnedState = url.searchParams.get("state");

    if (!storedState || !returnedState || storedState !== returnedState) {
      console.error("State parameter mismatch - potential CSRF attack");
      console.error("Stored:", storedState, "Returned:", returnedState);
      return NextResponse.redirect(new URL(`/${tenant}`, request.url));
    }

    // 現在のURLから認証コードを取得
    const currentUrl = request.url;

    // 認証コードをトークンに交換
    const tokens = await exchangeCodeForTokens(
      tenant,
      currentUrl,
      codeVerifier,
      storedState,
    );

    // アクセストークンが取得できたか確認
    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    // ユーザー情報を取得
    const userInfo = await getUserInfo(tenant, tokens.access_token);

    if (!userInfo.email) {
      throw new Error("No email received from user info");
    }

    // トークンの有効期限が必須
    if (!tokens.expires_in) {
      throw new Error("No token expiration received");
    }

    // UPSERT: 既存セッション更新 or 新規セッション作成
    await upsertSession({
      tenant,
      email: userInfo.email,
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });

    // AuthStateを削除（使用済み）
    await deleteAuthState(authState.id, tenant);

    // ログイン成功後、/homeにリダイレクト
    return NextResponse.redirect(new URL(`/${tenant}/home`, request.url));
  } catch (error) {
    console.error("Callback error:", error);

    // エラー時はトップページにリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }
}
