import { query } from "./db";

export async function getAvailableSlots(type: "events" | "garden", dateStr: string) {
  const date = new Date(dateStr);
  const dow = date.getDay();

  const [schedule] = await query(
    `SELECT is_open, slots FROM weekly_schedule WHERE calendar_type=$1 AND day_of_week=$2`,
    [type, dow]
  );
  if (!schedule || !schedule.is_open) return { isBlocked: true, slots: [] };

  const [blocked] = await query(
    `SELECT id FROM blocked_days WHERE calendar_type=$1 AND date=$2`,
    [type, dateStr]
  );
  if (blocked) return { isBlocked: true, slots: [] };

  const table = type === "events" ? "event_bookings" : "garden_bookings";
  const booked = await query(
    `SELECT start_time FROM ${table} WHERE status != 'cancelled' AND DATE(to_timestamp(start_time/1000)) = $1::date`,
    [dateStr]
  );
  const bookedTimes = new Set(booked.map((r: any) => new Date(Number(r.start_time)).toTimeString().slice(0,5)));

  const rawSlots = typeof schedule.slots === "string" ? JSON.parse(schedule.slots) : schedule.slots;
  const slots: { start: string; end: string; available: boolean }[] = [];

  for (const window of rawSlots) {
    const [sh, sm] = window.from.split(":").map(Number);
    const [eh, em] = window.to.split(":").map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const duration = type === "events" ? 30 : 60;
    while (cur + duration <= end) {
      const hh = String(Math.floor(cur / 60)).padStart(2, "0");
      const mm = String(cur % 60).padStart(2, "0");
      const endMin = cur + duration;
      const eh2 = String(Math.floor(endMin / 60)).padStart(2, "0");
      const em2 = String(endMin % 60).padStart(2, "0");
      slots.push({ start: `${hh}:${mm}`, end: `${eh2}:${em2}`, available: !bookedTimes.has(`${hh}:${mm}`) });
      cur += duration;
    }
  }
  return { isBlocked: false, slots };
}
