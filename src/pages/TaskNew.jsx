import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState } from '../components/ui.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { suggestSlots } from '../lib/scheduler.js';
import { TODAY } from '../lib/dates.js';

const EMPTY = { title: '', course: '', kind: 'assignment', deadline: '', priority: 'med', estimatedMinutes: '60', notes: '' };

export default function TaskNew() {
  const { actions, mine, lessons } = useApp();
  const nav = useNavigate();
  const [preview, setPreview] = useState(EMPTY);
  const est = Number(preview.estimatedMinutes);
  const ok = Number.isInteger(est) && est > 0 && est <= 1440;
  const slots = ok
    ? suggestSlots({ id: 'new', estimatedMinutes: est, deadline: preview.deadline || undefined }, { lessons, commitments: mine.commitments, blocks: mine.blocks }, { from: TODAY })
    : [];

  return (
    <main className="page" data-testid="page-task-new">
      <PageHeader title="Шинэ даалгавар нэмэх" sub="Бие даалт, лаборатори эсвэл шалгалтын мэдээллээ оруулна уу" />
      <div className="two-col">
        <TaskForm
          initial={EMPTY}
          onChange={setPreview}
          onCancel={() => nav(-1)}
          onSubmit={(v) => { const r = actions.addTask(v); if (r.ok) nav('/planner'); return r; }}
        />
        <section className="card" aria-labelledby="sg">
          <h2 id="sg">Санал болгох Study block</h2>
          <p className="muted sm">Хадгалсны дараа систем сул цагуудаас блок санал болгоно.</p>
          {slots.length === 0 ? (
            <EmptyState title="Сул цаг олдсонгүй.">Deadline эсвэл хугацааг өөрчилнө үү.</EmptyState>
          ) : (
            <ul className="list" data-testid="slot-preview">
              {slots.map((s, i) => (
                <li key={s.date + s.start} className={'row-item' + (i === 0 ? ' best' : '')}>
                  <div className="grow"><strong>{s.date.slice(5)} · {s.start} – {s.end}</strong>{i === 0 && <p className="sm"><span className="badge pri">Хамгийн тохиромжтой</span></p>}</div>
                  <strong>{Math.round(s.score * 100)}%</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
