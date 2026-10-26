import { addDays, toHHMM, toMin, weekday } from './dates.js';

export const DAY_START = 8 * 60;
export const DAY_END = 21 * 60;

// ctx: { lessons, commitments, blocks }
export function busyOn(date, ctx, ignoreId) {
  const wd = weekday(date);
  const out = [];
  (ctx.lessons || []).filter((l) => l.weekday === wd).forEach((l) => out.push([toMin(l.start), toMin(l.end)]));
  (ctx.commitments || []).filter((c) => c.days.includes(wd)).forEach((c) => out.push([toMin(c.start), toMin(c.end)]));
  (ctx.blocks || [])
    .filter((b) => b.date === date && b.id !== ignoreId && b.status !== 'missed')
    .forEach((b) => out.push([toMin(b.start), toMin(b.end)]));
  return out;
}

export function isFree(date, start, end, ctx, ignoreId) {
  const s = toMin(start);
  const e = toMin(end);
  return busyOn(date, ctx, ignoreId).every(([a, b]) => e <= a || s >= b);
}

export function findSlotOnDate(date, duration, ctx, ignoreId) {
  const busy = busyOn(date, ctx, ignoreId);
  for (let s = DAY_START; s + duration <= DAY_END; s += 30) {
    if (busy.every(([a, b]) => s + duration <= a || s >= b)) {
      return { date, start: toHHMM(s), end: toHHMM(s + duration) };
    }
  }
  return null;
}

export function blockDuration(task) {
  return Math.min(120, Math.max(15, Math.ceil(Number(task.estimatedMinutes) / 15) * 15));
}

export function suggestSlots(task, ctx, { from, limit = 3 }) {
  const dur = blockDuration(task);
  const horizon = addDays(from, 6);
  const last = task.deadline && task.deadline < horizon ? task.deadline : horizon;
  const out = [];
  for (let i = 0, d = from; d <= last && out.length < limit; i++, d = addDays(from, i)) {
    const slot = findSlotOnDate(d, dur, ctx);
    if (slot) out.push({ ...slot, taskId: task.id, score: Math.max(0.5, Math.round((0.95 - out.length * 0.07) * 100) / 100) });
  }
  return out;
}
