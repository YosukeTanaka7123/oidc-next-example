import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionById, invalidateSession } from "./lib/auth/session";
import { isValidTenant } from "./lib/auth/types";

const SESSION_COOKIE_NAME = (tenant: string) => `session_id_${tenant}`;

/**
 * Proxy設定（Next.js 16+）
 * 保護されたルート（/home, /profile）へのアクセスを制御
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ルートパスはそのまま通過
  if (pathname === "/") {
    return NextResponse.next();
  }

  // パスから tenant を抽出
  const pathParts = pathname.split("/").filter(Boolean);
  const tenant = pathParts[0];

  // テナントの検証
  if (!tenant || !isValidTenant(tenant)) {
    // 不正なテナントの場合はルートにリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 認証が必要なルートかチェック
  const isProtectedRoute =
    pathname.includes("/home") || pathname.includes("/profile");

  if (isProtectedRoute) {
    // セッションIDをクッキーから取得
    const sessionId = request.cookies.get(SESSION_COOKIE_NAME(tenant))?.value;

    if (!sessionId) {
      // セッションIDがない場合はログインページにリダイレクト
      const loginUrl = new URL(`/${tenant}/api/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // データベースからセッションを取得
    const session = await getSessionById(sessionId, tenant);

    // セッションチェック
    if (!session?.isLoggedIn || session.tenant !== tenant) {
      // 未認証の場合はログインページにリダイレクト
      const response = NextResponse.redirect(
        new URL(`/${tenant}/api/auth/login`, request.url),
      );
      response.cookies.delete(SESSION_COOKIE_NAME(tenant));
      return response;
    }

    // トークンの有効期限チェック
    if (session.expiresAt < new Date()) {
      // トークンが期限切れの場合はセッション無効化してログインページにリダイレクト
      await invalidateSession(sessionId, tenant);
      const response = NextResponse.redirect(
        new URL(`/${tenant}/api/auth/login`, request.url),
      );
      return response;
    }
  }

  return NextResponse.next();
}

/**
 * Proxyを適用するパスのマッチャー
 */
export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
