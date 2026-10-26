import { describe, it, expect } from 'vitest';
import { validateTask, validateCommitment, validateBreakdown, validateAuth, validateShopItem, validateTarget } from './validate.js';
import { calcGrade, neededExam } from './gradeCalc.js';
import { currentGPA, requiredAverage } from './gpaCalc.js';
import { suggestSlots, isFree, findSlotOnDate } from './scheduler.js';
import { weekday, addDays } from './dates.js';

describe('validate', () => {
  it('хоосон гарчигт алдаа өгнө', () => {
    expect(validateTask({ title: ' ', deadline: '2026-10-30', estimatedMinutes: '60', priority: 'med' }, { today: '2026-10-22' }).title).toBe('Гарчиг заавал оруулна уу');
  });
  it('өнгөрсөн deadline-г татгалзана, edit дээр зөвшөөрнө', () => {
    const v = { title: 'a', deadline: '2026-10-01', estimatedMinutes: '60', priority: 'med' };
    expect(validateTask(v, { today: '2026-10-22' }).deadline).toBeTruthy();
    expect(validateTask(v, { today: '2026-10-22', allowPast: true }).deadline).toBeUndefined();
  });
  it('хугацааны хязгаар', () => {
    const base = { title: 'a', deadline: '2026-10-30', priority: 'low' };
    expect(validateTask({ ...base, estimatedMinutes: '0' }).estimatedMinutes).toBeTruthy();
    expect(validateTask({ ...base, estimatedMinutes: '1441' }).estimatedMinutes).toBeTruthy();
    expect(validateTask({ ...base, estimatedMinutes: '90' })).toEqual({});
  });
  it('commitment: дуусах цаг эхлэхээс хойш', () => {
    const e = validateCommitment({ title: 'x', type: 'club', days: [1], start: '18:00', end: '17:00' });
    expect(e.end).toMatch(/хойш/);
    expect(validateCommitment({ title: 'x', type: 'club', days: [], start: '18:00', end: '19:00' }).days).toBeTruthy();
  });
  it('дүнгийн задаргаа 70-аас хэтрэхгүй', () => {
    expect(validateBreakdown({ attendance: 10, lab: 30, quiz: 30 }).breakdown).toBeUndefined();
    expect(validateBreakdown({ attendance: 10, lab: 30, quiz: 31 }).quiz).toBeTruthy();
    expect(validateBreakdown({ attendance: 10, lab: 30, quiz: 30, exam: 31 }).exam).toBeTruthy();
  });
  it('auth, shop, target', () => {
    expect(validateAuth({ email: 'bad', password: '123' }, 'login')).toHaveProperty('email');
    expect(validateAuth({ name: 'Бат', email: 'a@b.mn', password: 'Secret123', confirm: 'x' }, 'signup').confirm).toBeTruthy();
    expect(validateShopItem({ name: 'Шар малгай', type: 'clothes', pricePoints: '0' }).pricePoints).toBeTruthy();
    expect(validateTarget('4.5')).toBeTruthy();
    expect(validateTarget('3.6')).toBeNull();
  });
});

describe('gradeCalc', () => {
  it('62 + шалгалт 24 = 86, B+', () => {
    const r = calcGrade({ attendance: 10, lab: 27, quiz: 25 }, 24);
    expect(r.total).toBe(86);
    expect(r.letter).toBe('B+');
    expect(r.gradePoint).toBe(3.5);
  });
  it('A авахад шалгалтаас 28 хэрэгтэй', () => {
    const a = neededExam({ attendance: 10, lab: 27, quiz: 25 }).find((n) => n.letter === 'A');
    expect(a.exam).toBe(28);
    expect(a.possible).toBe(true);
  });
  it('боломжгүй үед possible=false', () => {
    expect(neededExam({ attendance: 0, lab: 0, quiz: 0 }).find((n) => n.letter === 'A').possible).toBe(false);
  });
});

describe('gpaCalc', () => {
  const sems = [{ gpa: 3.2, credits: 15 }, { gpa: 3.4, credits: 16 }, { gpa: 3.5, credits: 16 }, { gpa: 3.6, credits: 15 }, null, null, null, null];
  it('кредитээр жигнэсэн голч', () => {
    expect(currentGPA(sems).gpa).toBe(3.43);
    expect(currentGPA(sems).count).toBe(4);
  });
  it('зорилтод хүрэх дундаж', () => {
    const r = requiredAverage(sems, 3.6);
    expect(r.remaining).toBe(4);
    expect(r.required).toBeGreaterThan(3.7);
    expect(r.feasible).toBe(true);
  });
  it('боломжгүй зорилт', () => {
    expect(requiredAverage(sems, 4).feasible).toBe(false);
  });
});

describe('scheduler', () => {
  const lessons = [{ weekday: weekday('2026-10-22'), start: '08:30', end: '10:00' }];
  const ctx = { lessons, commitments: [], blocks: [] };
  it('хичээлтэй давхцахгүй сул цаг олно', () => {
    const s = findSlotOnDate('2026-10-22', 90, ctx);
    expect(s.start).toBe('10:00');
    expect(isFree('2026-10-22', '09:00', '10:30', ctx)).toBe(false);
  });
  it('deadline-аас хойш санал болгохгүй', () => {
    const out = suggestSlots({ id: 'x', estimatedMinutes: 60, deadline: '2026-10-23' }, ctx, { from: '2026-10-22', limit: 5 });
    expect(out.length).toBe(2);
    expect(out.every((o) => o.date <= '2026-10-23')).toBe(true);
  });
  it('хоцорсон блок цагийг эзлэхгүй', () => {
    const c = { ...ctx, blocks: [{ id: 'b', date: addDays('2026-10-22', 0), start: '10:00', end: '12:00', status: 'missed' }] };
    expect(isFree('2026-10-22', '10:00', '11:00', c)).toBe(true);
  });
});
