# Timely — Frontend (Бие даалт 1: Frontend + mock data)

React 18 + Vite + React Router. **Backend API руу хүсэлт илгээхгүй** — бүх өгөгдөл `src/mock/data.js` дахь mock бөгөөд `src/store/AppContext.jsx` дотор санах ойд хадгалагдана.

## Ажиллуулах

```bash
npm install
npm run dev          # хөгжүүлэлт (http://localhost:5173)
npm run build        # production build
npm run test:ci      # frontend тест (vitest)
npm run start:grader # build + preview, http://localhost:4173
```

## Mock нэвтрэлт

| Эрх | Имэйл | Нууц үг |
|---|---|---|
| Оюутан (member) | bolormaa@must.edu.mn | Secret123 |
| Админ (admin) | admin@must.edu.mn | Admin1234 |

Шинэ хэрэглэгчээр бүртгүүлж болно. "Өнөөдөр" нь `src/lib/dates.js` дахь `TODAY = 2026-10-22` тогтмол.

## Route ба page testId (`src/routes.js`)

| Route | testId | Эрх | Хариуцагч |
|---|---|---|---|
| `/` | page-dashboard | member | M02 |
| `/authenticate` | page-authenticate | guest | M01 |
| `/planner` | page-planner | member | M02 |
| `/tasks/new` | page-task-new | member | M03 |
| `/tasks/:id` | page-task-edit | member | M03 (reschedule хэсэг: M04) |
| `/commitments` | page-commitments | member | M04 |
| `/focus-timer` | page-focus-timer | member | M03 |
| `/grades` | page-grades | member | M05 |
| `/gpa-goal` | page-gpa-goal | member | M05 |
| `/gamification/shop` | page-shop | member | M05 |
| `/profile` | page-profile | member | M01 |
| `/admin/shop` | page-admin-shop | admin | M05 |

Тодорхойгүй route -> `page-not-found`. Зочин хамгаалагдсан route-д орвол `/authenticate`, оюутан `/admin/shop`-д орвол `/` руу шилжинэ.

## Бүтэц

```
src/
  routes.js            12 route + testId (team-spec.json-той таарна)
  App.jsx              router, Guard (role)
  store/AppContext.jsx mock store: auth + бүх CRUD үйлдэл (backend шатанд API client-ээр солино)
  mock/data.js         seed өгөгдөл
  lib/                 validate, scheduler, gradeCalc, gpaCalc, dates (цэвэр функцүүд, тесттэй)
  components/          Layout, Avatar, TaskForm, ui (Field, Badge, EmptyState ...)
  pages/               12 хуудас + NotFound
  test/ , lib/*.test.js
```

## Backend шатанд шилжих (Бие даалт 2)

`useApp().actions.*` бүрийг `src/api/` доторх client дуудлагаар солино. Хуудас бүр `actions`-ийн буцаах `{ok}` / `{error, field}` хэлбэрийг ашигладаг тул UI өөрчлөлт бага. Mock-ийн `date + start/end` блокийг backend-ийн `start/end` Date-тэй тааруулна.

## Mock-ийн тохиролцоо (баталгаажуулах)

- Блок: `{date:'YYYY-MM-DD', start:'HH:mm', end:'HH:mm'}` (backend дээр Date болно).
- Онооны бонус: даалгаврын нийт `actualMinutes` төлөвлөсөн хугацаанд хүрэх session-д +10.
- Focus Timer-д туршихад зориулсан "+10 мин (демо)" товч байгаа.
