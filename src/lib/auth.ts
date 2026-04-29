import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type UserRole } from "@/lib/constants/roles";
import {
  createSignedSessionToken,
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export { SESSION_COOKIE_NAME };

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export async function createSessionToken(user: AuthenticatedUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  };

  return createSignedSessionToken(payload);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
