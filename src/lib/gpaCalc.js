// list: [{semester, gpa, credits}] — зөвхөн оруулсан улирлууд (null байж болно)
export function currentGPA(list) {
  const done = list.filter((s) => s && s.gpa !== null && s.gpa !== '' && s.credits);
  const cr = done.reduce((a, s) => a + Number(s.credits), 0);
  if (!cr) return { gpa: 0, credits: 0, count: 0 };
  const pts = done.reduce((a, s) => a + Number(s.gpa) * Number(s.credits), 0);
  return { gpa: Math.round((pts / cr) * 100) / 100, credits: cr, count: done.length };
}

// Үлдсэн улирал бүр дунджаар өмнөх улирлын кредиттэй гэж үзнэ.
export function requiredAverage(list, target, totalSemesters = 8) {
  const cur = currentGPA(list);
  const remaining = totalSemesters - cur.count;
  if (remaining <= 0) return { ...cur, remaining: 0, required: null, feasible: cur.gpa >= target };
  const avgCr = cur.count ? cur.credits / cur.count : 15;
  const remCr = remaining * avgCr;
  const required = (target * (cur.credits + remCr) - cur.gpa * cur.credits) / remCr;
  const r = Math.round(required * 100) / 100;
  return { ...cur, remaining, required: r, feasible: r <= 4 };
}
