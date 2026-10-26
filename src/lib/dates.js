// Mock шатны "өнөөдөр". Backend шатанд бодит огноогоор солино.
export const TODAY = '2026-10-22';
export const DAY_NAMES = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

export const addDays = (d, n) => {
  const x = new Date(d + 'T00:00:00Z');
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
// Даваа = 0 ... Ням = 6
export const weekday = (d) => (new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7;
export const weekStart = (d) => addDays(d, -weekday(d));
export const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const toHHMM = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
export const durationMin = (b) => toMin(b.end) - toMin(b.start);
export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + 'T00:00:00Z').getTime());
export const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
