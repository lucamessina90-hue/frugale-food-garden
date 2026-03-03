import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { triggerWebhook } from "@/lib/webhook";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";

const CreateSchema = z.object({
  eventType: z.enum(["compleanno", "festa_privata", "aziendale", "altro"]),
  guestCount: z.number().int().min(1).max(5000),
  startTime: z.number(),
  endTime: z.number(),
  clientName: z.string().min(2).max(255),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(5).max(50),
  notes: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const token = searchParams.get("token");

  if (token) {
    const row = await queryOne(
      `SELECT * FROM event_bookings WHERE cancel_token = $1`, [token]
    );
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  }

  const rows = await query(
    `SELECT * FROM event_bookings ${status ? "WHERE status = $1" : ""} ORDER BY start_time DESC`,
    status ? [status] : []
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;
  const cancelToken = nanoid(32);

  const [row] = await query(
    `INSERT INTO event_bookings (event_type, guest_count, client_name, client_email, client_phone, notes, start_time, end_time, status, cancel_token)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9) RETURNING *`,
    [d.eventType, d.guestCount, d.clientName, d.clientEmail, d.clientPhone, d.notes ?? null, d.startTime, d.endTime, cancelToken]
  );

  await triggerWebhook("nuova_prenotazione_evento", {
    id: row.id, type: "event", clientName: d.clientName, clientEmail: d.clientEmail,
    clientPhone: d.clientPhone, eventType: d.eventType, guestCount: d.guestCount,
    startTime: new Date(d.startTime).toISOString(), endTime: new Date(d.endTime).toISOString(),
    status: "pending", notes: d.notes,
  });

  return NextResponse.json({ ok: true, cancelToken });
}

export async function PATCH(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, status, staffNotes, cancelToken } = body;

  // Cancel by token (public)
  if (cancelToken) {
    const existing = await queryOne(
      `SELECT * FROM event_bookings WHERE cancel_token = $1`, [cancelToken]
    );
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "cancelled")
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    await query(`UPDATE event_bookings SET status='cancelled', updated_at=NOW() WHERE cancel_token=$1`, [cancelToken]);
    await triggerWebhook("cancellazione_cliente", { type: "event", cancelToken, clientName: existing.client_name, clientEmail: existing.client_email });
    return NextResponse.json({ ok: true });
  }

  // Staff update
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;
  if (status !== undefined) { fields.push(`status=$${i++}`); values.push(status); }
  if (staffNotes !== undefined) { fields.push(`staff_notes=$${i++}`); values.push(staffNotes); }
  fields.push(`updated_at=NOW()`);
  values.push(id);

  const [row] = await query(
    `UPDATE event_bookings SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, values
  );

  if (status) {
    await triggerWebhook("cambio_stato", {
      id, type: "event", newStatus: status, clientName: row.client_name, clientEmail: row.client_email,
    });
  }
  return NextResponse.json({ ok: true, row });
}
