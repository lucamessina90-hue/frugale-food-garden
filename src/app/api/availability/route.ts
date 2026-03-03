import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as "events" | "garden" | null;
  const date = searchParams.get("date");
  const action = searchParams.get("action");

  // Get slots for a specific date
  if (action === "slots" && type && date) {
    const result = await getAvailableSlots(type, date);
    return NextResponse.json(result);
  }

  // Get weekly schedule
  if (action === "schedule" && type) {
    const rows = await query(
      `SELECT day_of_week, is_open, slots FROM weekly_schedule WHERE calendar_type = $1 ORDER BY day_of_week`,
      [type]
    );
    return NextResponse.json(rows);
  }

  // Get blocked days (staff only)
  if (action === "blocked") {
    if (!isStaffAuthenticatedFromRequest(req))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const rows = await query(
      `SELECT * FROM blocked_days ORDER BY date DESC`
    );
    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // Block a day
  if (action === "block") {
    const { calendarType, date, reason } = body;
    const [row] = await query(
      `INSERT INTO blocked_days (calendar_type, date, reason) VALUES ($1,$2,$3) RETURNING *`,
      [calendarType, date, reason ?? null]
    );
    return NextResponse.json({ ok: true, row });
  }

  // Unblock a day
  if (action === "unblock") {
    await query(`DELETE FROM blocked_days WHERE id = $1`, [body.id]);
    return NextResponse.json({ ok: true });
  }

  // Save weekly schedule
  if (action === "save_schedule") {
    const { calendarType, schedule } = body;
    // schedule: Array<{ dayOfWeek: number; isOpen: boolean; slots: {from,to}[] }>
    for (const day of schedule) {
      await query(
        `INSERT INTO weekly_schedule (calendar_type, day_of_week, is_open, slots, updated_at)
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (calendar_type, day_of_week)
         DO UPDATE SET is_open=$3, slots=$4, updated_at=NOW()`,
        [calendarType, day.dayOfWeek, day.isOpen, JSON.stringify(day.slots)]
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
