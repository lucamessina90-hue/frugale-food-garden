import { query, queryOne } from "./db";

export interface Slot { start: string; end: string; available: boolean; }

function generateSlots(from: string, to: string, durationMin: number): string[] {
  const slots: string[] = [];
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  let cur = fh * 60 + fm;
  const end = th * 60 + tm;
  while (cur + durationMin <= end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`);
    cur += durationMin;
  }
  return slots;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export async function getAvailableSlots(
  calendarType: "events" | "garden",
  date: string
): Promise<{ slots: Slot[]; isBlocked: boolean }> {
  // Check blocked days
  const blocked = await query(
    `SELECT id FROM blocked_days WHERE date = $1 AND (calendar_type = $2 OR calendar_type = 'all')`,
    [date, calendarType]
  );
  if (blocked.length > 0) return { slots: [], isBlocked: true };

  // Get weekly schedule for this day of week
  const dayOfWeek = new Date(date + "T12:00:00Z").getUTCDay();
  const schedule = await queryOne<{ is_open: boolean; slots: {from:string;to:string}[] }>(
    `SELECT is_open, slots FROM weekly_schedule WHERE calendar_type = $1 AND day_of_week = $2`,
    [calendarType, dayOfWeek]
  );

  if (!schedule || !schedule.is_open) return { slots: [], isBlocked: false };

  const duration = calendarType === "events" ? 30 : 60;

  // Get existing bookings for this date to mark unavailable slots
  const table = calendarType === "events" ? "event_bookings" : "garden_bookings";
  const dateStart = new Date(date + "T00:00:00Z").getTime();
  const dateEnd = new Date(date + "T23:59:59Z").getTime();
  const booked = await query<{ start_time: number }>(
    `SELECT start_time FROM ${table} WHERE start_time >= $1 AND start_time <= $2 AND status != 'cancelled'`,
    [dateStart, dateEnd]
  );
  const bookedTimes = new Set(
    booked.map(b => {
      const d = new Date(b.start_time);
      return `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
    })
  );

  // Build slots from all time windows
  const allSlots: Slot[] = [];
  for (const window of schedule.slots) {
    const starts = generateSlots(window.from, window.to, duration);
    for (const start of starts) {
      const end = addMinutes(start, duration);
      allSlots.push({ start, end, available: !bookedTimes.has(start) });
    }
  }

  return { slots: allSlots, isBlocked: false };
}
