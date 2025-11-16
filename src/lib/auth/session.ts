import type { AuthState, Session } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const AUTH_STATE_COOKIE_NAME = (tenant: string) => `auth_state_id_${tenant}`;
const SESSION_COOKIE_NAME = (tenant: string) => `session_id_${tenant}`;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const AUTH_STATE_MAX_AGE = 60 * 10; // 10 minutes

/**
 * Cookie options for session ID
 */
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_MAX_AGE,
  path: "/",
};

/**
 * Cookie options for auth state ID (short-lived)
 */
const authStateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: AUTH_STATE_MAX_AGE,
  path: "/",
};

// ============================================================================
// AuthState Management (Pre-Authentication)
// ============================================================================

/**
 * Create a new auth state for OIDC flow and set cookie
 */
export async function createAuthState(data: {
  codeVerifier: string;
  state: string;
  tenant: string;
}): Promise<AuthState> {
  // Create auth state in database
  const authState = await prisma.authState.create({
    data: {
      tenant: data.tenant,
      codeVerifier: data.codeVerifier,
      state: data.state,
      expiresAt: new Date(Date.now() + AUTH_STATE_MAX_AGE * 1000),
    },
  });

  // Set auth state ID in cookie
  const cookieStore = await cookies();
  cookieStore.set(
    AUTH_STATE_COOKIE_NAME(data.tenant),
    authState.id,
    authStateCookieOptions,
  );

  return authState;
}

/**
 * Get auth state from database by ID
 */
export async function getAuthStateById(
  authStateId: string,
  tenant: string,
): Promise<AuthState | null> {
  const authState = await prisma.authState.findFirst({
    where: { id: authStateId, tenant },
  });

  // Check expiration
  if (authState && authState.expiresAt < new Date()) {
    await deleteAuthState(authStateId, tenant);
    return null;
  }

  return authState;
}

/**
 * Get auth state from cookie
 */
export async function getAuthState(tenant: string): Promise<AuthState | null> {
  const cookieStore = await cookies();
  const authStateId = cookieStore.get(AUTH_STATE_COOKIE_NAME(tenant))?.value;

  if (!authStateId) {
    return null;
  }

  return await getAuthStateById(authStateId, tenant);
}

/**
 * Delete auth state from database and clear cookie
 */
export async function deleteAuthState(
  authStateId: string,
  tenant: string,
): Promise<void> {
  // Delete from database
  await prisma.authState.delete({
    where: { id: authStateId },
  });

  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_STATE_COOKIE_NAME(tenant));
}

/**
 * Clean up expired auth states
 */
export async function cleanupExpiredAuthStates(): Promise<number> {
  const result = await prisma.authState.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}

// ============================================================================
// Session Management (Post-Authentication)
// ============================================================================

/**
 * Upsert session (create or update) using unique constraint on (tenant, email)
 */
export async function upsertSession(data: {
  tenant: string;
  email: string;
  expiresAt: Date; // Required
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}): Promise<Session> {
  const session = await prisma.session.upsert({
    where: {
      unique_tenant_email: {
        tenant: data.tenant,
        email: data.email,
      },
    },
    update: {
      isLoggedIn: true,
      expiresAt: data.expiresAt,
      idToken: data.idToken,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    },
    create: {
      tenant: data.tenant,
      email: data.email,
      isLoggedIn: true,
      expiresAt: data.expiresAt,
      idToken: data.idToken,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    },
  });

  // Set session ID in cookie
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME(data.tenant),
    session.id,
    sessionCookieOptions,
  );

  return session;
}

/**
 * Get session from database by ID
 */
export async function getSessionById(
  sessionId: string,
  tenant: string,
): Promise<Session | null> {
  return await prisma.session.findFirst({
    where: { id: sessionId, tenant },
  });
}

/**
 * Get current session from cookie and database
 */
export async function getSession(tenant: string): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME(tenant))?.value;

  if (!sessionId) {
    return null;
  }

  const session = await getSessionById(sessionId, tenant);

  // Invalidate expired sessions
  if (session && session.expiresAt < new Date()) {
    await invalidateSession(sessionId, tenant);
    return null;
  }

  return session;
}

/**
 * Invalidate session (set isLoggedIn to false) and clear cookie
 */
export async function invalidateSession(
  sessionId: string,
  tenant: string,
): Promise<void> {
  // Set isLoggedIn to false instead of deleting
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      isLoggedIn: false,
      idToken: null,
      accessToken: null,
      refreshToken: null,
    },
  });

  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME(tenant));
}

/**
 * Delete session from database and clear cookie
 */
export async function deleteSession(
  sessionId: string,
  tenant: string,
): Promise<void> {
  // Delete from database
  await prisma.session.delete({
    where: { id: sessionId },
  });

  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME(tenant));
}

/**
 * Get current user information from session
 */
export async function getCurrentUser(tenant: string) {
  const session = await getSession(tenant);

  if (!session?.isLoggedIn || !session.email) {
    return null;
  }

  return {
    email: session.email,
    tenant: session.tenant,
  };
}

/**
 * Check if current session is valid
 */
export async function isSessionValid(tenant: string): Promise<boolean> {
  const session = await getSession(tenant);

  if (!session?.isLoggedIn) {
    return false;
  }

  // Check token expiration
  if (session.expiresAt < new Date()) {
    return false;
  }

  return true;
}
