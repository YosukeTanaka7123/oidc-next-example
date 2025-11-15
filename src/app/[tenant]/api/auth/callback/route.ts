import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/auth/cognito";
import { getSession } from "@/lib/auth/session";
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

    const session = await getSession();

    // セッションからcode_verifierとstateを取得
    const codeVerifier = session.codeVerifier as string | undefined;
    const storedState = session.state as string | undefined;

    if (!codeVerifier) {
      console.error("Missing code_verifier in session");
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

    // セッションにユーザー情報とトークンを保存
    session.isLoggedIn = true;
    session.email = userInfo.email;
    session.accessToken = tokens.access_token;
    // session.idToken = tokens.id_token;
    // session.refreshToken = tokens.refresh_token;
    session.tenant = tenant;

    // トークンの有効期限を計算（expires_inは秒単位）
    if (tokens.expires_in) {
      session.expiresAt = Date.now() + tokens.expires_in * 1000;
    }

    // code_verifierとstateは使用済みなので削除
    delete (session as { codeVerifier?: string }).codeVerifier;
    delete (session as { state?: string }).state;

    await session.save();

    // ログイン成功後、/homeにリダイレクト
    return NextResponse.redirect(new URL(`/${tenant}/home`, request.url));
  } catch (error) {
    console.error("Callback error:", error);

    // エラー時はトップページにリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }
}
