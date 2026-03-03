import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { triggerWebhook } from "@/lib/webhook";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await query(`SELECT * FROM event_bookings ORDER BY start_time DESC`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventType, guestCount, startTime, endTime, clientName, clientEmail, clientPhone, notes } = body;
  const cancelToken = nanoid(32);
  const [row] = await query(
    `INSERT INTO event_bookings (event_type, guest_count, client_name, client_email, client_phone, notes, start_time, end_time, status, cancel_token)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9) RETURNING *`,
    [eventType, guestCount || 1, clientName, clientEmail, clientPhone, notes ?? null, startTime, endTime, cancelToken]
  );
  await triggerWebhook("nuova_prenotazione_evento", {
    id: row.id, type: "event", clientName, clientEmail, clientPhone,
    eventType, guestCount, startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(), status: "pending", notes,
  });
  return NextResponse.json({ ok: true, cancelToken });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, staffNotes } = body;
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (status !== undefined) { fields.push(`status=$${i++}`); values.push(status); }
  if (staffNotes !== undefined) { fields.push(`staff_notes=$${i++}`); values.push(staffNotes); }
  fields.push(`updated_at=NOW()`);
  values.push(id);
  const [row] = await query(`UPDATE event_bookings SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, values);
  if (status) await triggerWebhook("cambio_stato", { id, type: "event", newStatus: status, clientName: row.client_name, clientEmail: row.client_email });
  return NextResponse.json({ ok: true, row });
}
