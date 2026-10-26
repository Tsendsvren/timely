import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Badge, PRIORITY, STATUS } from '../components/ui.jsx';
import { TODAY, addDays, weekStart, weekday, DAY_NAMES, toMin } from '../lib/dates.js';
import { suggestSlots } from '../lib/scheduler.js';

const PAGE_SIZE = 5;

export default function Planner() {
  const { mine, lessons, data, actions } = useApp();
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const start = weekStart(TODAY);
  const title = (id) => data.tasks.find((t) => t.id === id)?.title || '';

  const days = DAY_NAMES.map((n, i) => {
    const d = addDays(start, i);
    const items = [
      ...lessons.filter((l) => l.weekday === i).map((l) => ({ key: l.id, s: l.start, e: l.end, t: l.title, tone: 'blu' })),
      ...mine.commitments.filter((c) => c.days.includes(i)).map((c) => ({ key: c.id + d, s: c.start, e: c.end, t: c.title, tone: 'amb' })),
      ...mine.blocks.filter((b) => b.date === d).map((b) => ({ key: b.id, s: b.start, e: b.end, t: (b.status === 'missed' ? 'Хоцорсон: ' : 'Study: ') + title(b.taskId), tone: b.status === 'missed' ? 'red' : 'pri', to: `/tasks/${b.taskId}` })),
    ].sort((a, b) => toMin(a.s) - toMin(b.s));
    return { n, d, items };
  });

  const ctx = { lessons, commitments: mine.commitments, blocks: mine.blocks };
  const hasFuture = (id) => mine.blocks.some((b) => b.taskId === id && b.status === 'scheduled' && b.date >= TODAY);
  const suggestions = mine.tasks
    .filter((t) => t.status !== 'completed' && !hasFuture(t.id))
    .flatMap((t) => suggestSlots(t, ctx, { from: TODAY, limit: 1 }))
    .slice(0, 3);

  const filtered = mine.tasks
    .filter((t) => (status === 'all' ? true : t.status === status))
    .filter((t) => t.title.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const add = (s) => {
    const r = actions.addBlock({ taskId: s.taskId, date: s.date, start: s.start, end: s.end });
    setMsg(r.error || 'Study block нэмэгдлээ');
  };
  const replan = () => {
    const { moved } = actions.replan();
    setMsg(moved ? `${moved} блок шилжлээ` : 'Шилжүүлэх хоцорсон блок алга');
  };

  return (
    <main className="page" data-testid="page-planner">
      <PageHeader title="Ухаалаг цаг төлөвлөгч" sub={`${start} – ${addDays(start, 6)} · Хатуу хуваарь + сул цагт Study block`}>
        <button className="btn ghost" onClick={replan} data-testid="replan">Дахин төлөвлөх</button>
        <Link className="btn pri" to="/tasks/new">+ Даалгавар нэмэх</Link>
      </PageHeader>
      {msg && <p className="notice" role="status" data-testid="planner-msg">{msg}</p>}

      <section className="card" aria-labelledby="sug">
        <h2 id="sug">Санал болгосон Study block</h2>
        {suggestions.length === 0 ? (
          <p className="muted" data-testid="no-suggestions">Одоогоор санал алга. Даалгавар нэмж эсвэл сул цаг олдохгүй байна.</p>
        ) : (
          <ul className="chips-row" data-testid="suggestions">
            {suggestions.map((s) => (
              <li key={s.taskId + s.date + s.start} className="suggest">
                <div><strong>{s.date.slice(5)} {s.start}–{s.end}</strong><p className="muted sm">{title(s.taskId)} · {Math.round(s.score * 100)}%</p></div>
                <button className="btn pri sm" onClick={() => add(s)}>Нэмэх</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="calendar" data-testid="week-calendar" aria-label="7 хоногийн календарь">
        {days.map((day) => (
          <div key={day.d} className={'day' + (day.d === TODAY ? ' today' : '')}>
            <h3>{day.n} <span className="muted sm">{day.d.slice(8)}</span></h3>
            {day.items.length === 0 && <p className="muted sm">Сул</p>}
            {day.items.map((it) => {
              const body = (<><strong>{it.t}</strong><span className="sm">{it.s}–{it.e}</span></>);
              return it.to ? <Link key={it.key} to={it.to} className={`block ${it.tone}`}>{body}</Link> : <div key={it.key} className={`block ${it.tone}`}>{body}</div>;
            })}
          </div>
        ))}
      </section>

      <section className="card" aria-labelledby="tl">
        <div className="between wrap">
          <h2 id="tl">Даалгаврууд</h2>
          <div className="filters">
            <input type="search" placeholder="Хайх…" aria-label="Даалгавар хайх" data-testid="task-search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
            <select aria-label="Төлөвөөр шүүх" data-testid="task-status-filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">Бүгд</option>
              {Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Даалгавар олдсонгүй.">
            <Link className="btn pri sm" to="/tasks/new">Даалгавар нэмэх</Link>
          </EmptyState>
        ) : (
          <>
            <ul className="list" data-testid="task-list">
              {shown.map((t) => (
                <li key={t.id}>
                  <Link className="row-item" to={`/tasks/${t.id}`} data-testid="task-item">
                    <div className="grow"><strong>{t.title}</strong><p className="muted sm">Deadline: {t.deadline} · {t.actualMinutes}/{t.estimatedMinutes} мин</p></div>
                    <Badge tone={PRIORITY[t.priority][1]}>{PRIORITY[t.priority][0]}</Badge>
                    <Badge tone="gray">{STATUS[t.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pager">
              <button className="btn ghost sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)} data-testid="page-prev">←</button>
              <span className="muted sm" data-testid="page-info">{cur} / {pages}</span>
              <button className="btn ghost sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)} data-testid="page-next">→</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
