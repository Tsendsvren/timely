import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, ErrorBanner, Badge, PRIORITY } from '../components/ui.jsx';
import { Link } from 'react-router-dom';
import { TODAY } from '../lib/dates.js';

const fmt = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

export default function FocusTimer() {
  const { mine, actions } = useApp();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const pending = mine.tasks.filter((t) => t.status !== 'completed');
  const [taskId, setTaskId] = useState(params.get('task') || '');
  const [state, setState] = useState('idle'); // idle | running | paused
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (state !== 'running') return undefined;
    timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer.current);
  }, [state]);

  const task = pending.find((t) => t.id === taskId);
  const minutes = Math.floor(elapsed / 60);
  const planned = task ? task.estimatedMinutes * 60 : 0;
  const pct = planned ? Math.min(1, elapsed / planned) : 0;
  const R = 130, C = 2 * Math.PI * R;
  const today = mine.sessions.filter((s) => s.date === TODAY);
  const bonus = task && task.actualMinutes < task.estimatedMinutes && task.actualMinutes + minutes >= task.estimatedMinutes ? 10 : 0;

  const stop = () => {
    if (minutes < 1) { setError('Дор хаяж 1 минут ажиллуулж байж оноо авна'); return; }
    const r = actions.finishSession({ taskId, minutes });
    if (r.error) { setError(r.error); return; }
    setState('idle'); setElapsed(0);
    nav('/');
  };

  return (
    <main className="page" data-testid="page-focus-timer">
      <PageHeader title="Focus Timer" sub="Даалгавраа сонгоод Start дарж цаг хэмжинэ" />
      <ErrorBanner>{error}</ErrorBanner>
      {pending.length === 0 ? (
        <EmptyState title="Эхлээд даалгавар нэмнэ үү"><Link className="btn pri sm" to="/tasks/new">Даалгавар нэмэх</Link></EmptyState>
      ) : (
        <div className="two-col wide-left">
          <section className="card center timer-card" aria-label="Таймер">
            <label className="sm muted" htmlFor="task">Даалгавар сонгох</label>
            <select id="task" data-testid="task-select" value={taskId} disabled={state !== 'idle'} onChange={(e) => { setTaskId(e.target.value); setError(''); }}>
              <option value="">— сонгоно уу —</option>
              {pending.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <div className="ring" role="timer" aria-live="off">
              <svg viewBox="0 0 300 300" width="280" height="280" style={{ maxWidth: '100%' }}>
                <circle cx="150" cy="150" r={R} fill="none" stroke="var(--pri-l)" strokeWidth="16" />
                <circle cx="150" cy="150" r={R} fill="none" stroke="var(--pri)" strokeWidth="16" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 150 150)" />
              </svg>
              <div className="ring-text"><strong data-testid="timer-display">{fmt(elapsed)}</strong><span className="muted sm">{task ? `${task.estimatedMinutes} минутаас` : 'даалгавар сонгоно уу'}</span></div>
            </div>
            <div className="chips controls">
              {state !== 'running' ? (
                <button className="btn soft" disabled={!task} data-testid="start" onClick={() => { setState('running'); setError(''); }}>▶ {state === 'paused' ? 'Үргэлжлүүлэх' : 'Start'}</button>
              ) : (
                <button className="btn ghost" data-testid="pause" onClick={() => setState('paused')}>❚❚ Pause</button>
              )}
              <button className="btn pri" disabled={state === 'idle'} data-testid="stop" onClick={stop}>■ Stop & оноо авах</button>
              <button className="btn ghost sm" disabled={state === 'idle'} data-testid="demo-add" onClick={() => setElapsed((e) => e + 600)}>+10 мин (демо)</button>
            </div>
            <p className="muted sm">Stop дарахад бодит минутаар оноо бодогдож User.points нэмэгдэнэ.</p>
          </section>
          <div className="stack">
            <section className="card" aria-labelledby="ac">
              <h2 id="ac">Идэвхтэй даалгавар</h2>
              {task ? (
                <div className="subcard"><strong>{task.title}</strong><p className="sm"><Badge tone={PRIORITY[task.priority][1]}>{PRIORITY[task.priority][0]}</Badge> <span className="muted">Deadline: {task.deadline}</span></p></div>
              ) : <p className="muted">Даалгавар сонгоогүй байна.</p>}
            </section>
            <section className="card" aria-labelledby="pt">
              <h2 id="pt">Энэ session-ий оноо</h2>
              <div className="metric"><span>{minutes} бодит минут</span><strong data-testid="points-preview">+{minutes + bonus}</strong></div>
              <div className="metric"><span>Хугацаандаа дуусгасан бонус</span><strong>+{bonus}</strong></div>
            </section>
            <section className="card" aria-labelledby="hs">
              <h2 id="hs">Өнөөдрийн session-ууд</h2>
              {today.length === 0 ? <p className="muted">Өнөөдөр session алга.</p> : (
                <ul className="list">{today.map((s) => <li key={s.id} className="row-item"><div className="grow">{mine.tasks.find((t) => t.id === s.taskId)?.title}<p className="muted sm">{s.minutes} мин</p></div><strong>+{s.pointsEarned}</strong></li>)}</ul>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
