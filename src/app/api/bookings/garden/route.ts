import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { triggerWebhook } from "@/lib/webhook";
import { isStaffAuthenticatedFromRequest } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";

const CreateSchema = z.object({
  spaceType: z.enum(["giardino_privato", "terrazzo", "balcone", "spazio_commerciale"]),
  surfaceArea: z.string().max(100).optional(),
  startTime: z.number(),
  endTime: z.number(),
  clientName: z.string().min(2).max(255),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(5).max(50),
  address: z.string().min(5).max(500),
  notes: z.string().max(2000).optional(),
  photoUrls: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  if (!isStaffAuthenticatedFromRequest(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const rows = await query(
    `SELECT * FROM garden_bookings ${status ? "WHERE status = $1" : ""} ORDER BY start_time DESC`,
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
    `INSERT INTO garden_bookings (space_type, surface_area, client_name, client_email, client_phone, address, notes, photo_urls, start_time, end_time, status, cancel_token)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11) RETURNING *`,
    [d.spaceType, d.surfaceArea ?? null, d.clientName, d.clientEmail, d.clientPhone,
     d.address, d.notes ?? null, JSON.stringify(d.photoUrls), d.startTime, d.endTime, cancelToken]
  );

  await triggerWebhook("nuovo_sopralluogo_giardino", {
    id: row.id, type: "garden", clientName: d.clientName, clientEmail: d.clientEmail,
    clientPhone: d.clientPhone, spaceType: d.spaceType, surfaceArea: d.surfaceArea,
    address: d.address, startTime: new Date(d.startTime).toISOString(),
    endTime: new Date(d.endTime).toISOString(), status: "pending", notes: d.notes,
  });

  return NextResponse.json({ ok: true, cancelToken });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { cancelToken } = body;

  // Public cancel by token
  if (cancelToken && !isStaffAuthenticatedFromRequest(req)) {
    const existing = await queryOne(
      `SELECT * FROM garden_bookings WHERE cancel_token = $1`, [cancelToken]
    );
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.status === "cancelled")
      return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
    await query(`UPDATE garden_bookings SET status='cancelled', updated_at=NOW() WHERE cancel_token=$1`, [cancelToken]);
    await triggerWebhook("cancellazione_cliente", {
      type: "garden", cancelToken, clientName: existing.client_name, clientEmail: existing.client_email,
    });
    return NextResponse.json({ ok: true });
  }

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

  const [row] = await query(
    `UPDATE garden_bookings SET ${fields.join(",")} WHERE id=$${i} RETURNING *`, values
  );

  if (status) {
    await triggerWebhook("cambio_stato", {
      id, type: "garden", newStatus: status, clientName: row.client_name, clientEmail: row.client_email,
    });
  }
  return NextResponse.json({ ok: true, row });
}
