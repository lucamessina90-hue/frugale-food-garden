import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.STAFF_PASSWORD)
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  const token = createToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ffg_staff", token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("ffg_staff");
  return res;
}
