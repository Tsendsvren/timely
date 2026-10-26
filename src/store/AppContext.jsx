import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { seed, lessons } from '../mock/data.js';
import { TODAY, addDays } from '../lib/dates.js';
import { findSlotOnDate, isFree } from '../lib/scheduler.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Бүх өгөгдөл санах ойд (mock). Backend руу хүсэлт илгээхгүй.
export function AppProvider({ children, initialUserId = null }) {
  const [data, setData] = useState(() => structuredClone(seed));
  const ref = useRef(data);
  const [userId, setUserId] = useState(initialUserId);

  const commit = (fn) => {
    const next = fn(ref.current);
    ref.current = next;
    setData(next);
    return next;
  };
  const nid = (p) => `${p}${++ref.current.seq}`;
  const cur = () => ref.current;
  const ctxFor = (uid) => ({
    lessons,
    commitments: cur().commitments.filter((c) => c.userId === uid),
    blocks: cur().blocks.filter((b) => b.userId === uid),
  });
  const owns = (arr, id) => arr.find((x) => x.id === id && x.userId === userId);

  const user = data.users.find((u) => u.id === userId) || null;
  const profile = (user && data.profiles[user.id]) || null;

  const actions = {
    // ---- auth ----
    login(email, password) {
      const u = cur().users.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.password === password);
      if (!u) return { error: 'Имэйл эсвэл нууц үг буруу' };
      setUserId(u.id);
      return { ok: true, user: u };
    },
    signup({ name, email, password }) {
      if (cur().users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
        return { error: 'Энэ имэйл бүртгэлтэй байна', field: 'email' };
      const id = nid('U');
      commit((d) => ({
        ...d,
        users: [...d.users, { id, name: name.trim(), email, password, role: 'member' }],
        profiles: { ...d.profiles, [id]: { points: 0, owned: [], equipped: [], gpaTarget: 3.5 } },
        semesters: { ...d.semesters, [id]: Array(8).fill(null) },
      }));
      setUserId(id);
      return { ok: true };
    },
    logout: () => setUserId(null),
    updateProfile({ name, email }) {
      if (cur().users.some((x) => x.id !== userId && x.email.toLowerCase() === email.toLowerCase()))
        return { error: 'Энэ имэйл бүртгэлтэй байна', field: 'email' };
      commit((d) => ({ ...d, users: d.users.map((u) => (u.id === userId ? { ...u, name: name.trim(), email } : u)) }));
      return { ok: true };
    },
    // ---- tasks ----
    addTask(v) {
      const task = {
        id: nid('T'), userId, title: v.title.trim(), course: v.course || '', kind: v.kind || 'assignment',
        deadline: v.deadline, priority: v.priority, estimatedMinutes: Number(v.estimatedMinutes),
        actualMinutes: 0, status: 'pending', notes: v.notes || '',
      };
      commit((d) => ({ ...d, tasks: [...d.tasks, task] }));
      return { ok: true, task };
    },
    updateTask(id, patch) {
      if (!owns(cur().tasks, id)) return { error: 'Даалгавар олдсонгүй' };
      commit((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
      return { ok: true };
    },
    deleteTask(id) {
      if (!owns(cur().tasks, id)) return { error: 'Даалгавар олдсонгүй' };
      commit((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id), blocks: d.blocks.filter((b) => b.taskId !== id) }));
      return { ok: true };
    },
    // ---- study blocks ----
    addBlock({ taskId, date, start, end }) {
      if (!owns(cur().tasks, taskId)) return { error: 'Даалгавар олдсонгүй' };
      if (!isFree(date, start, end, ctxFor(userId))) return { error: 'Энэ цагт өөр үйл ажиллагаа байна' };
      const b = { id: nid('B'), userId, taskId, date, start, end, status: 'scheduled' };
      commit((d) => ({ ...d, blocks: [...d.blocks, b] }));
      return { ok: true, block: b };
    },
    updateBlock(id, patch) {
      if (!owns(cur().blocks, id)) return { error: 'Блок олдсонгүй' };
      commit((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
      return { ok: true };
    },
    deleteBlock(id) {
      if (!owns(cur().blocks, id)) return { error: 'Блок олдсонгүй' };
      commit((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
      return { ok: true };
    },
    rescheduleBlock(id, date) {
      const b = owns(cur().blocks, id);
      if (!b) return { error: 'Блок олдсонгүй' };
      const [h1, m1] = b.start.split(':').map(Number);
      const [h2, m2] = b.end.split(':').map(Number);
      const dur = h2 * 60 + m2 - (h1 * 60 + m1);
      const slot = findSlotOnDate(date, dur, ctxFor(userId), id);
      if (!slot) return { error: 'Тухайн өдөр сул цаг алга, өөр өдөр сонгоно уу' };
      commit((d) => ({
        ...d,
        blocks: d.blocks.map((x) => (x.id === id ? { ...x, ...slot, status: 'scheduled' } : x)),
        tasks: d.tasks.map((t) => (t.id === b.taskId ? { ...t, status: 'rescheduled' } : t)),
      }));
      return { ok: true, slot };
    },
    replan() {
      const missed = cur().blocks.filter((b) => b.userId === userId && b.status === 'missed');
      let moved = 0;
      missed.forEach((b) => {
        for (let i = 0; i < 7; i++) {
          const r = actions.rescheduleBlock(b.id, addDays(TODAY, i));
          if (r.ok) { moved++; break; }
        }
      });
      return { moved };
    },
    // ---- commitments ----
    addCommitment(v) {
      const c = { id: nid('C'), userId, title: v.title.trim(), type: v.type, days: [...v.days].sort(), start: v.start, end: v.end };
      commit((d) => ({ ...d, commitments: [...d.commitments, c] }));
      return { ok: true, commitment: c };
    },
    updateCommitment(id, v) {
      if (!owns(cur().commitments, id)) return { error: 'Олдсонгүй' };
      commit((d) => ({ ...d, commitments: d.commitments.map((c) => (c.id === id ? { ...c, ...v, days: [...v.days].sort() } : c)) }));
      return { ok: true };
    },
    deleteCommitment(id) {
      if (!owns(cur().commitments, id)) return { error: 'Олдсонгүй' };
      commit((d) => ({ ...d, commitments: d.commitments.filter((c) => c.id !== id) }));
      return { ok: true };
    },
    // ---- focus timer ----
    finishSession({ taskId, minutes }) {
      const task = owns(cur().tasks, taskId);
      if (!task) return { error: 'Даалгавар олдсонгүй' };
      const after = task.actualMinutes + minutes;
      const bonus = task.actualMinutes < task.estimatedMinutes && after >= task.estimatedMinutes ? 10 : 0;
      const pointsEarned = minutes + bonus;
      commit((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, actualMinutes: after } : t)),
        sessions: [...d.sessions, { id: nid('F'), userId, taskId, date: TODAY, minutes, pointsEarned }],
        profiles: { ...d.profiles, [userId]: { ...d.profiles[userId], points: d.profiles[userId].points + pointsEarned } },
      }));
      return { ok: true, pointsEarned, bonus, total: cur().profiles[userId].points };
    },
    // ---- grades ----
    addGrade({ courseName, credits }) {
      if (cur().grades.some((g) => g.userId === userId && g.courseName.toLowerCase() === courseName.trim().toLowerCase()))
        return { error: 'Энэ хичээл бүртгэлтэй байна', field: 'courseName' };
      const g = { id: nid('G'), userId, courseName: courseName.trim(), credits: Number(credits), attendance: 0, lab: 0, quiz: 0, exam: null };
      commit((d) => ({ ...d, grades: [...d.grades, g] }));
      return { ok: true, grade: g };
    },
    updateGrade(id, patch) {
      if (!owns(cur().grades, id)) return { error: 'Хичээл олдсонгүй' };
      commit((d) => ({ ...d, grades: d.grades.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
      return { ok: true };
    },
    deleteGrade(id) {
      if (!owns(cur().grades, id)) return { error: 'Хичээл олдсонгүй' };
      commit((d) => ({ ...d, grades: d.grades.filter((g) => g.id !== id) }));
      return { ok: true };
    },
    // ---- GPA ----
    saveGpa(list, target) {
      commit((d) => ({
        ...d,
        semesters: { ...d.semesters, [userId]: list },
        profiles: { ...d.profiles, [userId]: { ...d.profiles[userId], gpaTarget: Number(target) } },
      }));
      return { ok: true };
    },
    // ---- shop ----
    buyItem(id) {
      const item = cur().shopItems.find((i) => i.id === id && i.isActive);
      if (!item) return { error: 'Бараа олдсонгүй' };
      const p = cur().profiles[userId];
      if (p.owned.includes(id)) return { error: 'Энэ зүйлийг аль хэдийн авсан байна' };
      if (p.points < item.pricePoints) return { error: `Оноо хүрэхгүй байна (дутуу: ${item.pricePoints - p.points})` };
      commit((d) => ({
        ...d,
        purchases: d.purchases + 1,
        profiles: { ...d.profiles, [userId]: { ...p, points: p.points - item.pricePoints, owned: [...p.owned, id] } },
      }));
      return { ok: true };
    },
    toggleEquip(id) {
      const p = cur().profiles[userId];
      if (!p.owned.includes(id)) return { error: 'Худалдаж аваагүй зүйл байна' };
      const item = cur().shopItems.find((i) => i.id === id);
      let eq;
      if (p.equipped.includes(id)) eq = p.equipped.filter((x) => x !== id);
      else {
        const sameType = p.equipped.filter((x) => cur().shopItems.find((i) => i.id === x)?.type === item.type);
        eq = [...p.equipped.filter((x) => !sameType.includes(x)), id];
      }
      commit((d) => ({ ...d, profiles: { ...d.profiles, [userId]: { ...p, equipped: eq } } }));
      return { ok: true };
    },
    // ---- admin shop ----
    addShopItem(v) {
      if (cur().shopItems.some((i) => i.name.toLowerCase() === v.name.trim().toLowerCase()))
        return { error: 'Энэ нэртэй бараа байна', field: 'name' };
      const item = { id: nid('S'), name: v.name.trim(), type: v.type, pricePoints: Number(v.pricePoints), isActive: true, look: v.look || {} };
      commit((d) => ({ ...d, shopItems: [...d.shopItems, item] }));
      return { ok: true, item };
    },
    updateShopItem(id, v) {
      if (cur().shopItems.some((i) => i.id !== id && i.name.toLowerCase() === v.name.trim().toLowerCase()))
        return { error: 'Энэ нэртэй бараа байна', field: 'name' };
      commit((d) => ({ ...d, shopItems: d.shopItems.map((i) => (i.id === id ? { ...i, name: v.name.trim(), type: v.type, pricePoints: Number(v.pricePoints), look: v.look || i.look } : i)) }));
      return { ok: true };
    },
    deleteShopItem(id) {
      const owned = Object.values(cur().profiles).some((p) => p.owned.includes(id));
      commit((d) => ({ ...d, shopItems: owned ? d.shopItems.map((i) => (i.id === id ? { ...i, isActive: false } : i)) : d.shopItems.filter((i) => i.id !== id) }));
      return { ok: true, softDeleted: owned };
    },
  };

  const mine = useMemo(() => {
    const f = (a) => a.filter((x) => x.userId === userId);
    return {
      tasks: f(data.tasks), blocks: f(data.blocks), commitments: f(data.commitments),
      grades: f(data.grades), sessions: f(data.sessions), semesters: data.semesters[userId] || Array(8).fill(null),
    };
  }, [data, userId]);

  const value = { data, user, profile, mine, lessons, actions };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
