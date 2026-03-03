import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [ev] = await query(`SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='confirmed') AS confirmed, COUNT(*) FILTER (WHERE status='cancelled') AS cancelled, COUNT(*) AS total FROM event_bookings`);
  const [gd] = await query(`SELECT COUNT(*) FILTER (WHERE status='pending') AS pending, COUNT(*) FILTER (WHERE status='confirmed') AS confirmed, COUNT(*) FILTER (WHERE status='cancelled') AS cancelled, COUNT(*) FILTER (WHERE status='completed') AS completed, COUNT(*) AS total FROM garden_bookings`);
  return NextResponse.json({
    events: { pending: parseInt(ev.pending), confirmed: parseInt(ev.confirmed), cancelled: parseInt(ev.cancelled), total: parseInt(ev.total) },
    garden: { pending: parseInt(gd.pending), confirmed: parseInt(gd.confirmed), cancelled: parseInt(gd.cancelled), completed: parseInt(gd.completed), total: parseInt(gd.total) },
  });
}
