import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Badge, Progress } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { TODAY, addDays, weekday, weekStart, DAY_NAMES, toMin, durationMin } from '../lib/dates.js';

export default function Dashboard() {
  const { user, profile, data, mine, lessons, actions } = useApp();
  const wd = weekday(TODAY);
  const taskTitle = (id) => data.tasks.find((t) => t.id === id)?.title || 'Даалгавар';

  const items = [
    ...lessons.filter((l) => l.weekday === wd).map((l) => ({ key: l.id, start: l.start, end: l.end, title: l.title, sub: l.room, tag: 'Хичээл', tone: 'blu' })),
    ...mine.commitments.filter((c) => c.days.includes(wd)).map((c) => ({ key: c.id, start: c.start, end: c.end, title: c.title, sub: 'Гадуурх ачаалал', tag: 'Commitment', tone: 'amb' })),
    ...mine.blocks.filter((b) => b.date === TODAY && b.status !== 'missed').map((b) => ({ key: b.id, block: b, start: b.start, end: b.end, title: 'Study block: ' + taskTitle(b.taskId), sub: b.status === 'done' ? 'Дууссан' : 'Санал болгосон', tag: 'Study block', tone: 'pri' })),
  ].sort((a, b) => toMin(a.start) - toMin(b.start));

  const start = weekStart(TODAY);
  const workload = DAY_NAMES.map((n, i) => {
    const d = addDays(start, i);
    const mins =
      lessons.filter((l) => l.weekday === i).reduce((a, l) => a + durationMin(l), 0) +
      mine.commitments.filter((c) => c.days.includes(i)).reduce((a, c) => a + durationMin(c), 0) +
      mine.blocks.filter((b) => b.date === d && b.status !== 'missed').reduce((a, b) => a + durationMin(b), 0);
    return { n, d, h: Math.round((mins / 60) * 10) / 10 };
  });
  const maxH = Math.max(1, ...workload.map((w) => w.h));
  const total = Math.round(workload.reduce((a, w) => a + w.h, 0) * 10) / 10;

  const Y = addDays(TODAY, -1);
  const yBlocks = mine.blocks.filter((b) => b.date === Y);
  const yDone = yBlocks.filter((b) => b.status === 'done').length;
  const ySessions = mine.sessions.filter((s) => s.date === Y);
  const yMin = ySessions.reduce((a, s) => a + s.minutes, 0);
  const yPts = ySessions.reduce((a, s) => a + s.pointsEarned, 0);
  const rate = yBlocks.length ? Math.round((yDone / yBlocks.length) * 100) : 0;
  const studyToday = items.filter((i) => i.block).length;
  const plannedH = Math.round((items.filter((i) => i.tone !== 'blu').reduce((a, i) => a + (toMin(i.end) - toMin(i.start)), 0) / 60) * 10) / 10;
  const equipped = profile.equipped.map((id) => data.shopItems.find((i) => i.id === id)).filter(Boolean);
  const level = Math.floor(profile.points / 170) + 1;

  return (
    <main className="page" data-testid="page-dashboard">
      <PageHeader title={`Сайн байна уу, ${user.name.split(' ')[0]}`} sub={`${TODAY} · Өнөөдөр ${studyToday} Study block төлөвлөгдсөн`}>
        <Link className="btn pri" to="/tasks/new">+ Даалгавар нэмэх</Link>
      </PageHeader>
      <div className="grid-dash">
        <div className="stack">
          <div className="stats">
            <div className="card stat"><span className="muted sm">Study block</span><strong data-testid="stat-blocks">{studyToday}</strong><span className="muted sm">өнөөдөр</span></div>
            <div className="card stat"><span className="muted sm">Төлөвлөсөн цаг</span><strong>{plannedH} цаг</strong><span className="muted sm">блок + ачаалал</span></div>
            <div className="card stat"><span className="muted sm">Өчигдрийн гүйцэтгэл</span><strong data-testid="stat-rate">{rate}%</strong><span className="muted sm">{yDone}/{yBlocks.length} блок</span></div>
          </div>
          <section className="card" aria-labelledby="sched">
            <h2 id="sched">Өнөөдрийн хуваарь</h2>
            {items.length === 0 ? (
              <EmptyState title="Өнөөдөр төлөвлөгөө алга.">
                <Link className="btn pri sm" to="/tasks/new">Даалгавар нэмэх</Link>
              </EmptyState>
            ) : (
              <ul className="list" data-testid="schedule">
                {items.map((i) => (
                  <li key={i.key} className="row-item">
                    <span className="time">{i.start} – {i.end}</span>
                    <span className={`bar ${i.tone}`} />
                    <div className="grow"><strong>{i.title}</strong><p className="muted sm">{i.sub}</p></div>
                    <Badge tone={i.tone}>{i.tag}</Badge>
                    {i.block && i.block.status !== 'done' && (
                      <>
                        <Link className="btn ghost sm" to={`/focus-timer?task=${i.block.taskId}`}>Эхлүүлэх</Link>
                        <button className="btn ghost sm" onClick={() => actions.updateBlock(i.block.id, { status: 'done' })}>Дууссан</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card" aria-labelledby="load">
            <div className="between"><h2 id="load">Долоо хоногийн ачаалал (цаг)</h2><span className="muted sm">Нийт {total} цаг</span></div>
            <div className="chart" data-testid="workload">
              {workload.map((w) => (
                <div key={w.n} className="col">
                  <span className="sm">{w.h}</span>
                  <span className={'colbar' + (w.d === TODAY ? ' today' : '')} style={{ height: (w.h / maxH) * 100 + 'px' }} />
                  <span className="muted sm">{w.n}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="stack">
          <section className="card center" aria-label="Timely аватар">
            <div className="stage"><Avatar items={equipped} size={130} /></div>
            <h2>Timely · Level {level}</h2>
            <Progress value={profile.points % 170} max={170} />
            <p className="muted sm">Дараагийн түвшин хүртэл {170 - (profile.points % 170)} оноо</p>
            <div className="chips">{equipped.map((i) => <Badge key={i.id} tone="amb">{i.name}</Badge>)}</div>
          </section>
          <section className="card" aria-labelledby="yday">
            <h2 id="yday">Өчигдрийн гүйцэтгэл</h2>
            <div className="metric"><span>Study block</span><strong>{yDone} / {yBlocks.length}</strong></div>
            <Progress value={yDone} max={Math.max(1, yBlocks.length)} />
            <div className="metric"><span>Focus хугацаа</span><strong>{yMin} мин</strong></div>
            <Progress value={yMin} max={180} tone="blu" />
            <div className="metric"><span>Авсан оноо</span><strong>+{yPts}</strong></div>
          </section>
        </div>
      </div>
    </main>
  );
}
