import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text: string, params?: any[]) {
  const { rows } = await pool.query(text, params);
  return rows;
}

export async function queryOne(text: string, params?: any[]) {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_bookings (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      guest_count INTEGER DEFAULT 1,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      client_phone VARCHAR(50) NOT NULL,
      notes TEXT,
      start_time BIGINT NOT NULL,
      end_time BIGINT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      staff_notes TEXT,
      cancel_token VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS garden_bookings (
      id SERIAL PRIMARY KEY,
      space_type VARCHAR(100) NOT NULL,
      surface_area VARCHAR(100),
      address TEXT NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_email VARCHAR(255) NOT NULL,
      client_phone VARCHAR(50) NOT NULL,
      notes TEXT,
      photo_urls JSONB DEFAULT '[]',
      start_time BIGINT NOT NULL,
      end_time BIGINT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      staff_notes TEXT,
      cancel_token VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blocked_days (
      id SERIAL PRIMARY KEY,
      calendar_type VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS weekly_schedule (
      id SERIAL PRIMARY KEY,
      calendar_type VARCHAR(50) NOT NULL,
      day_of_week INTEGER NOT NULL,
      is_open BOOLEAN DEFAULT true,
      slots JSONB DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(calendar_type, day_of_week)
    );
  `);

  const existing = await query(`SELECT COUNT(*) as c FROM weekly_schedule`);
  if (parseInt(existing[0].c) === 0) {
    const defaults = [
      { type: "events", days: [
        { dow: 1, open: true, slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        { dow: 2, open: true, slots: [{from:"10:00",to:"12:00"},{from:"15:00",to:"17:00"}] },
        { dow: 3, open: true, slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        { dow: 4, open: true, slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        { dow: 5, open: true, slots: [{from:"09:00",to:"13:00"},{from:"14:00",to:"19:00"}] },
        { dow: 6, open: false, slots: [] },
        { dow: 0, open: false, slots: [] },
      ]},
      { type: "garden", days: [
        { dow: 1, open: true, slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        { dow: 2, open: true, slots: [{from:"10:00",to:"12:00"},{from:"15:00",to:"17:00"}] },
        { dow: 3, open: true, slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        { dow: 4, open: true, slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        { dow: 5, open: true, slots: [{from:"08:00",to:"12:00"},{from:"14:00",to:"18:00"}] },
        { dow: 6, open: false, slots: [] },
        { dow: 0, open: false, slots: [] },
      ]},
    ];
    for (const cal of defaults) {
      for (const d of cal.days) {
        await pool.query(
          `INSERT INTO weekly_schedule (calendar_type, day_of_week, is_open, slots) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [cal.type, d.dow, d.open, JSON.stringify(d.slots)]
        );
      }
    }
  }
  return { ok: true, message: "Database initialized" };
}
