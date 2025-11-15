import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { SessionData } from "./lib/auth/types";
import { isValidTenant } from "./lib/auth/types";

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

  // セッションを取得
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET as string,
    cookieName: "oidc_session",
  });

  // 認証が必要なルートかチェック
  const isProtectedRoute =
    pathname.includes("/home") || pathname.includes("/profile");

  if (isProtectedRoute) {
    // セッションチェック
    if (!session.isLoggedIn || session.tenant !== tenant) {
      // 未認証の場合はログインページにリダイレクト
      const loginUrl = new URL(`/${tenant}/api/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // トークンの有効期限チェック
    if (session.expiresAt && Date.now() >= session.expiresAt) {
      // トークンが期限切れの場合はログインページにリダイレクト
      session.destroy();
      const loginUrl = new URL(`/${tenant}/api/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
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
