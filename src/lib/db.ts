import { Pool } from "pg";

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDb();
  const result = await db.query(sql, params);
  return result.rows;
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// ── DB init (run once) ───────────────────────────────────────────────────────
export async function initDb() {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS event_bookings (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(32) NOT NULL,
      guest_count INTEGER NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(320) NOT NULL,
      client_phone VARCHAR(64) NOT NULL,
      notes TEXT,
      start_time BIGINT NOT NULL,
      end_time BIGINT NOT NULL,
      status VARCHAR(16) DEFAULT 'pending' NOT NULL,
      staff_notes TEXT,
      cancel_token VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS garden_bookings (
      id SERIAL PRIMARY KEY,
      space_type VARCHAR(32) NOT NULL,
      surface_area VARCHAR(64),
      address TEXT NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(320) NOT NULL,
      client_phone VARCHAR(64) NOT NULL,
      notes TEXT,
      photo_urls JSONB DEFAULT '[]',
      start_time BIGINT NOT NULL,
      end_time BIGINT NOT NULL,
      status VARCHAR(16) DEFAULT 'pending' NOT NULL,
      staff_notes TEXT,
      cancel_token VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocked_days (
      id SERIAL PRIMARY KEY,
      calendar_type VARCHAR(16) DEFAULT 'all' NOT NULL,
      date VARCHAR(10) NOT NULL,
      reason VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weekly_schedule (
      id SERIAL PRIMARY KEY,
      calendar_type VARCHAR(16) NOT NULL,
      day_of_week INTEGER NOT NULL,
      slots JSONB DEFAULT '[]',
      is_open BOOLEAN DEFAULT true NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      UNIQUE(calendar_type, day_of_week)
    );
  `);

  // Seed default weekly schedule if empty
  const existing = await queryOne("SELECT id FROM weekly_schedule LIMIT 1");
  if (!existing) {
    const defaults: Record<string, Record<number, { isOpen: boolean; slots: {from:string;to:string}[] }>> = {
      events: {
        1: { isOpen: true,  slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        2: { isOpen: true,  slots: [{from:"10:00",to:"12:00"},{from:"15:00",to:"17:00"}] },
        3: { isOpen: true,  slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        4: { isOpen: true,  slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        5: { isOpen: true,  slots: [{from:"09:00",to:"13:00"}] },
        6: { isOpen: false, slots: [] },
        0: { isOpen: false, slots: [] },
      },
      garden: {
        1: { isOpen: true,  slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        2: { isOpen: true,  slots: [{from:"10:00",to:"12:00"},{from:"15:00",to:"17:00"}] },
        3: { isOpen: true,  slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        4: { isOpen: true,  slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        5: { isOpen: true,  slots: [{from:"08:00",to:"12:00"}] },
        6: { isOpen: false, slots: [] },
        0: { isOpen: false, slots: [] },
      }
    };
    for (const [calType, days] of Object.entries(defaults)) {
      for (const [day, cfg] of Object.entries(days)) {
        await db.query(
          `INSERT INTO weekly_schedule (calendar_type, day_of_week, slots, is_open) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [calType, parseInt(day), JSON.stringify(cfg.slots), cfg.isOpen]
        );
      }
    }
  }
}
