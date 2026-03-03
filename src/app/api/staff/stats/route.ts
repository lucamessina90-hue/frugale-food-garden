import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [evStats] = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status='pending') AS pending,
      COUNT(*) FILTER (WHERE status='confirmed') AS confirmed,
      COUNT(*) FILTER (WHERE status='cancelled') AS cancelled,
      COUNT(*) AS total
    FROM event_bookings
  `);
  const [gdStats] = await query(`
    SELECT
      COUNT(*) FILTER (WHERE status='pending') AS pending,
      COUNT(*) FILTER (WHERE status='confirmed') AS confirmed,
      COUNT(*) FILTER (WHERE status='cancelled') AS cancelled,
      COUNT(*) FILTER (WHERE status='completed') AS completed,
      COUNT(*) AS total
    FROM garden_bookings
  `);

  return NextResponse.json({
    events: {
      pending: parseInt(evStats.pending), confirmed: parseInt(evStats.confirmed),
      cancelled: parseInt(evStats.cancelled), total: parseInt(evStats.total),
    },
    garden: {
      pending: parseInt(gdStats.pending), confirmed: parseInt(gdStats.confirmed),
      cancelled: parseInt(gdStats.cancelled), completed: parseInt(gdStats.completed),
      total: parseInt(gdStats.total),
    },
  });
}
