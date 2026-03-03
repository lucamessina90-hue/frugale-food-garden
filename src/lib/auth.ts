import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE = "ffg_staff";
const SECRET = process.env.STAFF_SECRET ?? "dev-secret-change-me";

export function createToken(): string {
  return Buffer.from(`${SECRET}:${Date.now()}`).toString("base64");
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [secret] = decoded.split(":");
    return secret === SECRET;
  } catch {
    return false;
  }
}

export async function isStaffAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return token ? verifyToken(token) : false;
}

export function isStaffAuthenticatedFromRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE)?.value;
  return token ? verifyToken(token) : false;
}

export const STAFF_COOKIE = COOKIE;
