import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "ffg_staff";

export function createToken(): string {
  return Buffer.from(`staff:${Date.now()}:${Math.random()}`).toString("base64");
}

export async function isStaffAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return !!token?.value;
}

export function isStaffAuthenticatedFromRequest(req: NextRequest): boolean {
  return !!req.cookies.get(COOKIE_NAME)?.value;
}
