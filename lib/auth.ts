import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "expense_session";
const encoder = new TextEncoder();

type Session = {
  email: string;
};

function getSecret() {
  const secret = process.env.APP_AUTH_SECRET;
  if (!secret) {
    throw new Error("APP_AUTH_SECRET is not configured.");
  }
  return encoder.encode(secret);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .setIssuedAt()
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.email || typeof payload.email !== "string") {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export function verifyStaticCredentials(email: string, password: string) {
  const envEmail = process.env.APP_LOGIN_EMAIL;
  const envPassword = process.env.APP_LOGIN_PASSWORD;

  if (!envEmail || !envPassword) {
    throw new Error(
      "APP_LOGIN_EMAIL and APP_LOGIN_PASSWORD must be configured.",
    );
  }

  return email === envEmail && password === envPassword;
}
