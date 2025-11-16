import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildLogoutUrl } from "@/lib/auth/cognito";
import { getLogoutRedirectUrl } from "@/lib/auth/config";
import { getSession, invalidateSession } from "@/lib/auth/session";
import { isValidTenant } from "@/lib/auth/types";

/**
 * ログアウトエンドポイント
 * セッションを破棄し、Cognitoからもログアウトする
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

    // セッションを無効化
    const session = await getSession(tenant);
    if (session) {
      await invalidateSession(session.id, tenant);
    }

    // Cognitoのログアウトエンドポイントにリダイレクト
    const logoutRedirectUri = getLogoutRedirectUrl();
    const logoutUrl = buildLogoutUrl(tenant, logoutRedirectUri);

    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error("Logout error:", error);

    // エラー時でもトップページにリダイレクト
    return NextResponse.redirect(new URL("/", request.url));
  }
}
