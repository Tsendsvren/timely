import { addDays, TODAY } from '../lib/dates.js';

const Y = addDays(TODAY, -1);
const T1 = addDays(TODAY, 1);

export const lessons = [
  { id: 'L1', weekday: 0, start: '09:00', end: '10:30', title: 'Дискрет математик', room: 'Б-203' },
  { id: 'L2', weekday: 0, start: '14:00', end: '15:30', title: 'Өгөгдлийн сан', room: 'Б-105' },
  { id: 'L3', weekday: 1, start: '08:30', end: '10:00', title: 'Алгоритм', room: 'А-301' },
  { id: 'L4', weekday: 2, start: '09:00', end: '10:30', title: 'Дискрет математик', room: 'Б-203' },
  { id: 'L5', weekday: 2, start: '14:00', end: '15:30', title: 'Өгөгдлийн сан', room: 'Б-105' },
  { id: 'L6', weekday: 3, start: '08:30', end: '10:00', title: 'Алгоритм', room: 'А-301' },
  { id: 'L7', weekday: 3, start: '13:00', end: '14:30', title: 'Вэб программчлал', room: 'Л-12' },
  { id: 'L8', weekday: 4, start: '09:00', end: '10:30', title: 'Вэб программчлал', room: 'Л-12' },
];

export const seed = {
  seq: 100,
  users: [
    { id: 'U01', name: 'Болормаа Батаа', email: 'bolormaa@must.edu.mn', password: 'Secret123', role: 'member' },
    { id: 'U99', name: 'Админ', email: 'admin@must.edu.mn', password: 'Admin1234', role: 'admin' },
  ],
  profiles: {
    U01: { points: 1250, owned: ['S01', 'S02'], equipped: ['S01'], gpaTarget: 3.6 },
    U99: { points: 0, owned: [], equipped: [], gpaTarget: 3.6 },
  },
  tasks: [
    { id: 'T01', userId: 'U01', title: 'Өгөгдлийн сангийн лаб 3 — тайлан', course: 'Өгөгдлийн сан', kind: 'lab', deadline: T1, priority: 'high', estimatedMinutes: 90, actualMinutes: 54, status: 'pending', notes: '' },
    { id: 'T02', userId: 'U01', title: 'Алгоритмын сорилын бэлтгэл', course: 'Алгоритм', kind: 'quiz', deadline: addDays(TODAY, 4), priority: 'med', estimatedMinutes: 60, actualMinutes: 45, status: 'pending', notes: '' },
    { id: 'T03', userId: 'U01', title: 'Дискрет математикийн бие даалт', course: 'Дискрет математик', kind: 'assignment', deadline: addDays(TODAY, 8), priority: 'low', estimatedMinutes: 120, actualMinutes: 0, status: 'pending', notes: '' },
    { id: 'T04', userId: 'U01', title: 'Вэб төслийн ноорог', course: 'Вэб программчлал', kind: 'assignment', deadline: addDays(TODAY, -2), priority: 'med', estimatedMinutes: 180, actualMinutes: 175, status: 'completed', notes: '' },
  ],
  blocks: [
    { id: 'B01', userId: 'U01', taskId: 'T01', date: TODAY, start: '11:00', end: '12:30', status: 'scheduled' },
    { id: 'B02', userId: 'U01', taskId: 'T02', date: TODAY, start: '19:30', end: '21:00', status: 'scheduled' },
    { id: 'B03', userId: 'U01', taskId: 'T01', date: Y, start: '14:00', end: '15:30', status: 'missed' },
    { id: 'B04', userId: 'U01', taskId: 'T03', date: T1, start: '11:00', end: '13:00', status: 'scheduled' },
    { id: 'B05', userId: 'U01', taskId: 'T02', date: Y, start: '11:00', end: '12:00', status: 'done' },
    { id: 'B06', userId: 'U01', taskId: 'T04', date: Y, start: '16:00', end: '18:00', status: 'done' },
    { id: 'B07', userId: 'U01', taskId: 'T03', date: Y, start: '19:00', end: '20:30', status: 'done' },
  ],
  commitments: [
    { id: 'C01', userId: 'U01', title: 'Part-time ажил — кофе шоп', type: 'job', days: [1], start: '13:00', end: '17:00' },
    { id: 'C02', userId: 'U01', title: 'Робот клубын уулзалт', type: 'club', days: [0, 3], start: '16:00', end: '18:00' },
    { id: 'C03', userId: 'U01', title: 'Өглөөний гүйлт', type: 'habit', days: [0, 1, 2, 3, 4, 5, 6], start: '07:00', end: '07:30' },
    { id: 'C04', userId: 'U01', title: 'Англи хэлний дадал', type: 'habit', days: [5], start: '10:00', end: '12:00' },
  ],
  sessions: [{ id: 'F01', userId: 'U01', taskId: 'T02', date: Y, minutes: 142, pointsEarned: 85 }],
  grades: [
    { id: 'G01', userId: 'U01', courseName: 'Өгөгдлийн сан', credits: 3, attendance: 10, lab: 27, quiz: 25, exam: null },
    { id: 'G02', userId: 'U01', courseName: 'Алгоритм', credits: 3, attendance: 9, lab: 24, quiz: 20, exam: null },
    { id: 'G03', userId: 'U01', courseName: 'Вэб программчлал', credits: 2, attendance: 10, lab: 28, quiz: 26, exam: 27 },
  ],
  semesters: {
    U01: [
      { semester: 1, gpa: 3.2, credits: 15 },
      { semester: 2, gpa: 3.4, credits: 16 },
      { semester: 3, gpa: 3.5, credits: 16 },
      { semester: 4, gpa: 3.6, credits: 15 },
      null, null, null, null,
    ],
  },
  shopItems: [
    { id: 'S01', name: 'Улаан малгай', type: 'clothes', pricePoints: 200, isActive: true, look: { hat: '#EF4444' } },
    { id: 'S02', name: 'Нил ягаан өнгө', type: 'color', pricePoints: 150, isActive: true, look: { color: '#8B5CF6' } },
    { id: 'S03', name: 'Нарны шил', type: 'accessory', pricePoints: 300, isActive: true, look: { glasses: true } },
    { id: 'S04', name: 'Ягаан өнгө', type: 'color', pricePoints: 150, isActive: true, look: { color: '#EC4899' } },
    { id: 'S05', name: 'Оюутны титэм', type: 'accessory', pricePoints: 1200, isActive: true, look: { crown: true } },
    { id: 'S06', name: 'Ногоон өнгө', type: 'color', pricePoints: 150, isActive: true, look: { color: '#22C55E' } },
    { id: 'S07', name: 'Цэнхэр малгай', type: 'clothes', pricePoints: 250, isActive: true, look: { hat: '#3B82F6' } },
    { id: 'S08', name: 'Алтан малгай', type: 'clothes', pricePoints: 500, isActive: true, look: { hat: '#F5A524' } },
  ],
  purchases: 312,
};
