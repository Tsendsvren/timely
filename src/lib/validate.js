import { isDate, isTime, toMin } from './dates.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const int = (v) => Number.isInteger(Number(v)) && String(v).trim() !== '';

export function validateAuth(v, mode) {
  const e = {};
  if (mode === 'signup' && (!v.name || v.name.trim().length < 2)) e.name = 'Нэр оруулна уу';
  if (!EMAIL.test(v.email || '')) e.email = 'Имэйл хаяг буруу байна';
  if (!v.password || v.password.length < 8) e.password = 'Нууц үг 8-аас дээш тэмдэгт байна';
  if (mode === 'signup' && v.password !== v.confirm) e.confirm = 'Нууц үг таарахгүй байна';
  return e;
}

export function validateTask(v, { today, allowPast = false } = {}) {
  const e = {};
  if (!v.title || !v.title.trim()) e.title = 'Гарчиг заавал оруулна уу';
  else if (v.title.trim().length > 120) e.title = 'Гарчиг 120 тэмдэгтээс хэтрэхгүй';
  if (!v.deadline) e.deadline = 'Deadline сонгоно уу';
  else if (!isDate(v.deadline)) e.deadline = 'Огноо буруу байна';
  else if (!allowPast && today && v.deadline < today) e.deadline = 'Deadline өнгөрсөн байна';
  if (!int(v.estimatedMinutes) || Number(v.estimatedMinutes) < 1 || Number(v.estimatedMinutes) > 1440)
    e.estimatedMinutes = 'Хугацаа 1–1440 минут байна';
  if (!['high', 'med', 'low'].includes(v.priority)) e.priority = 'Ач холбогдол сонгоно уу';
  return e;
}

export function validateCommitment(v) {
  const e = {};
  if (!v.title || !v.title.trim()) e.title = 'Нэр оруулна уу';
  if (!['job', 'club', 'habit'].includes(v.type)) e.type = 'Төрөл сонгоно уу';
  if (!v.days || v.days.length === 0) e.days = 'Дор хаяж нэг өдөр сонгоно уу';
  if (!isTime(v.start || '')) e.start = 'Эхлэх цаг буруу (HH:mm)';
  if (!isTime(v.end || '')) e.end = 'Дуусах цаг буруу (HH:mm)';
  if (!e.start && !e.end && toMin(v.end) <= toMin(v.start)) e.end = 'Дуусах цаг эхлэх цагаас хойш байна';
  return e;
}

export const GRADE_MAX = { attendance: 10, lab: 30, quiz: 30, exam: 30 };

export function validateBreakdown(b) {
  const e = {};
  for (const k of ['attendance', 'lab', 'quiz']) {
    const n = Number(b[k]);
    if (b[k] === '' || Number.isNaN(n) || n < 0 || n > GRADE_MAX[k]) e[k] = `Оноо 0–${GRADE_MAX[k]} хооронд байна`;
  }
  if (b.exam !== null && b.exam !== '' && b.exam !== undefined) {
    const n = Number(b.exam);
    if (Number.isNaN(n) || n < 0 || n > 30) e.exam = 'Шалгалтын оноо 0–30 байна';
  }
  if (!e.attendance && !e.lab && !e.quiz && Number(b.attendance) + Number(b.lab) + Number(b.quiz) > 70)
    e.breakdown = 'Нийт задаргаа 70 оноо хэтэрсэн';
  return e;
}

export function validateCourse(v) {
  const e = {};
  if (!v.courseName || !v.courseName.trim()) e.courseName = 'Хичээлийн нэр оруулна уу';
  if (!int(v.credits) || Number(v.credits) < 1 || Number(v.credits) > 10) e.credits = 'Кредит 1–10 байна';
  return e;
}

export function validateSemester(v) {
  const e = {};
  if (v.gpa === '' || Number.isNaN(Number(v.gpa)) || Number(v.gpa) < 0 || Number(v.gpa) > 4) e.gpa = 'Голч 0–4.0 байна';
  if (!int(v.credits) || Number(v.credits) < 1 || Number(v.credits) > 40) e.credits = 'Кредит 1–40 байна';
  return e;
}

export function validateTarget(t) {
  const n = Number(t);
  return t === '' || Number.isNaN(n) || n < 0 || n > 4 ? 'Зорилтот голч 0–4.0 байна' : null;
}

export function validateShopItem(v) {
  const e = {};
  if (!v.name || v.name.trim().length < 2) e.name = 'Нэр оруулна уу';
  else if (v.name.trim().length > 60) e.name = 'Нэр 60 тэмдэгтээс хэтрэхгүй';
  if (!['clothes', 'color', 'accessory'].includes(v.type)) e.type = 'Төрөл сонгоно уу';
  if (!int(v.pricePoints) || Number(v.pricePoints) < 1) e.pricePoints = 'Үнэ 0-ээс их байна';
  return e;
}

export function validateProfile(v) {
  const e = {};
  if (!v.name || v.name.trim().length < 2) e.name = 'Нэр оруулна уу';
  if (!EMAIL.test(v.email || '')) e.email = 'Имэйл хаяг буруу байна';
  return e;
}
