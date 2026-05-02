import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { login } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const result = await login(body as { email: string; password: string });
    const response = NextResponse.json({
      user: result.user,
      redirectTo: result.redirectTo,
    });
    const secureCookie =
      new URL(request.url).protocol === "https:" ||
      process.env.AUTH_URL?.startsWith("https://") === true;

    response.cookies.set(SESSION_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }
}
