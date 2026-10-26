import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Badge } from '../components/ui.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { TODAY, addDays } from '../lib/dates.js';

function MissedPanel({ task }) {
  const { mine, actions } = useApp();
  const missed = mine.blocks.filter((b) => b.taskId === task.id && b.status === 'missed');
  const options = [1, 2, 3].map((n) => addDays(TODAY, n));
  const [pick, setPick] = useState({});
  const [msg, setMsg] = useState('');
  const move = (b) => {
    const r = actions.rescheduleBlock(b.id, pick[b.id] || options[0]);
    setMsg(r.error || 'Шилжүүллээ');
  };
  return (
    <section className="card" aria-labelledby="ms" data-testid="missed-panel">
      <div className="between"><h2 id="ms">Хоцорсон блокууд</h2><Badge tone="red">{missed.length} амжаагүй</Badge></div>
      {missed.length === 0 ? (
        <EmptyState title="Хоцорсон блок алга." />
      ) : (
        missed.map((b) => (
          <div key={b.id} className="subcard" data-testid="missed-block">
            <strong>{b.date} · {b.start} – {b.end}</strong>
            <p className="muted sm">Шилжүүлэх өдөр</p>
            <div className="chips">
              {options.map((d) => (
                <button key={d} type="button" className={'chip' + ((pick[b.id] || options[0]) === d ? ' on' : '')} onClick={() => setPick((p) => ({ ...p, [b.id]: d }))}>{d.slice(5)}</button>
              ))}
            </div>
            <div className="form-actions left">
              <button className="btn pri sm" onClick={() => move(b)} data-testid="reschedule">Шилжүүлэх</button>
              <button className="btn ghost sm" onClick={() => actions.deleteBlock(b.id)}>Устгах</button>
            </div>
          </div>
        ))
      )}
      {msg && <p className="notice" role="status" data-testid="reschedule-msg">{msg}</p>}
    </section>
  );
}

export default function TaskEdit() {
  const { id } = useParams();
  const { mine, actions } = useApp();
  const nav = useNavigate();
  const task = mine.tasks.find((t) => t.id === id);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState('');

  if (!task) {
    return (
      <main className="page" data-testid="page-task-edit">
        <EmptyState title="Даалгавар олдсонгүй">
          <Link className="btn pri sm" to="/planner">Төлөвлөгч рүү буцах</Link>
        </EmptyState>
      </main>
    );
  }
  return (
    <main className="page" data-testid="page-task-edit">
      <PageHeader title="Даалгавар засах & дахин төлөвлөх" sub={`#${task.id}`}>
        {!confirm ? (
          <button className="btn ghost" onClick={() => setConfirm(true)} data-testid="delete">Устгах</button>
        ) : (
          <span className="confirm" role="alertdialog" aria-label="Устгах баталгаажуулалт">
            Энэ даалгаврыг устгах уу?
            <button className="btn danger sm" data-testid="confirm-delete" onClick={() => { actions.deleteTask(task.id); nav('/planner'); }}>Тийм</button>
            <button className="btn ghost sm" onClick={() => setConfirm(false)}>Үгүй</button>
          </span>
        )}
      </PageHeader>
      {saved && <p className="notice" role="status" data-testid="saved-msg">{saved}</p>}
      <div className="two-col">
        <TaskForm
          mode="edit"
          initial={{ ...task, estimatedMinutes: String(task.estimatedMinutes), actualMinutes: String(task.actualMinutes) }}
          onCancel={() => nav('/planner')}
          onSubmit={(v) => {
            const r = actions.updateTask(task.id, { title: v.title.trim(), course: v.course, kind: v.kind, deadline: v.deadline, priority: v.priority, estimatedMinutes: v.estimatedMinutes, actualMinutes: v.actualMinutes, status: v.status, notes: v.notes });
            if (r.ok) setSaved('Өөрчлөлт хадгалагдлаа');
            return r;
          }}
        />
        <MissedPanel task={task} />
      </div>
    </main>
  );
}
