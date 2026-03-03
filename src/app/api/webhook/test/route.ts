import { NextRequest, NextResponse } from "next/server";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";
import { triggerWebhook } from "@/lib/webhook";

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await triggerWebhook("test_connection" as any, {
      message: "Test connessione da Frugale Food Garden gestionale",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Webhook non raggiunto" }, { status: 502 });
  }
}
