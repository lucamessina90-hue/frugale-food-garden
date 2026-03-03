import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "events" | "garden" | null;
  const date = searchParams.get("date");
  const action = searchParams.get("action");
  if (action === "slots" && type && date) {
    const result = await getAvailableSlots(type, date);
    return NextResponse.json(result);
  }
  if (action === "schedule" && type) {
    const rows = await query(`SELECT day_of_week, is_open, slots FROM weekly_schedule WHERE calendar_type = $1 ORDER BY day_of_week`, [type]);
    return NextResponse.json(rows);
  }
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.action === "save_schedule") {
    const { calendarType, schedule } = body;
    for (const day of schedule) {
      await query(
        `INSERT INTO weekly_schedule (calendar_type, day_of_week, is_open, slots, updated_at) VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (calendar_type, day_of_week) DO UPDATE SET is_open=$3, slots=$4, updated_at=NOW()`,
        [calendarType, day.dayOfWeek, day.isOpen, JSON.stringify(day.slots)]
      );
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
