import { useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Badge, Field, Input, Segmented, CTYPE } from '../components/ui.jsx';
import { validateCommitment } from '../lib/validate.js';
import { DAY_NAMES, durationMin } from '../lib/dates.js';

const BLANK = { title: '', type: 'habit', days: [], start: '18:00', end: '19:30' };

export default function Commitments() {
  const { mine, actions } = useApp();
  const [v, setV] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState('');
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));
  const toggleDay = (i) => set('days', v.days.includes(i) ? v.days.filter((d) => d !== i) : [...v.days, i]);

  const hours = (type) => Math.round((mine.commitments.filter((c) => c.type === type).reduce((a, c) => a + durationMin(c) * c.days.length, 0) / 60) * 10) / 10;

  const submit = (e) => {
    e.preventDefault();
    const er = validateCommitment(v);
    setErr(er);
    if (Object.keys(er).length) return;
    const r = editId ? actions.updateCommitment(editId, v) : actions.addCommitment(v);
    if (r.error) { setMsg(r.error); return; }
    setMsg(editId ? 'Өөрчлөлт хадгалагдлаа' : 'Ачаалал нэмэгдлээ');
    setV(BLANK); setEditId(null);
  };
  const edit = (c) => { setEditId(c.id); setV({ title: c.title, type: c.type, days: c.days, start: c.start, end: c.end }); setErr({}); setMsg(''); };

  return (
    <main className="page" data-testid="page-commitments">
      <PageHeader title="Гадуурх ачаалал & Дадал" sub="Ажил, клуб, тогтмол дадлаа бүртгэж төлөвлөгөөнд тусгана" />
      <div className="two-col wide-left">
        <div className="stack">
          <div className="stats">
            {Object.entries(CTYPE).map(([k, [l]]) => (
              <div key={k} className="card stat"><span className="muted sm">{l} (7 хоног)</span><strong data-testid={`hours-${k}`}>{hours(k)} цаг</strong></div>
            ))}
          </div>
          <section className="card" aria-labelledby="cl">
            <h2 id="cl">Бүртгэлтэй ачаалал</h2>
            {mine.commitments.length === 0 ? (
              <EmptyState title="Гадуурх ачаалал бүртгээгүй байна.">Ажил, клуб, дадлаа нэмээрэй.</EmptyState>
            ) : (
              <ul className="list" data-testid="commitment-list">
                {mine.commitments.map((c) => (
                  <li key={c.id} className="row-item" data-testid="commitment-item">
                    <div className="grow"><strong>{c.title}</strong><p className="muted sm">{c.days.map((d) => DAY_NAMES[d]).join(', ')} · {c.start} – {c.end}</p></div>
                    <Badge tone={CTYPE[c.type][1]}>{CTYPE[c.type][0]}</Badge>
                    <button className="btn ghost sm" aria-label={`${c.title} засах`} onClick={() => edit(c)}>Засах</button>
                    <button className="btn ghost sm" aria-label={`${c.title} устгах`} onClick={() => actions.deleteCommitment(c.id)}>Устгах</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <form className="card form" onSubmit={submit} noValidate data-testid="commitment-form">
          <h2>{editId ? 'Ачаалал засах' : 'Шинэ ачаалал нэмэх'}</h2>
          {msg && <p className="notice" role="status" data-testid="commit-msg">{msg}</p>}
          <Field label="Нэр" name="title" error={err.title}><Input name="title" value={v.title} onChange={(e) => set('title', e.target.value)} error={err.title} placeholder="Жишээ: Бокс дасгал" /></Field>
          <Field label="Төрөл" name="type" error={err.type}>
            <Segmented name="type" value={v.type} onChange={(x) => set('type', x)} options={[['job', 'Ажил'], ['club', 'Клуб'], ['habit', 'Дадал']]} />
          </Field>
          <Field label="Давтагдах өдрүүд" name="days" error={err.days}>
            <div className="chips" role="group" aria-label="Өдрүүд">
              {DAY_NAMES.map((d, i) => (
                <button type="button" key={d} aria-pressed={v.days.includes(i)} className={'chip' + (v.days.includes(i) ? ' on' : '')} data-testid={`day-${i}`} onClick={() => toggleDay(i)}>{d}</button>
              ))}
            </div>
          </Field>
          <div className="row">
            <Field label="Эхлэх" name="start" error={err.start}><Input name="start" type="time" value={v.start} onChange={(e) => set('start', e.target.value)} error={err.start} /></Field>
            <Field label="Дуусах" name="end" error={err.end}><Input name="end" type="time" value={v.end} onChange={(e) => set('end', e.target.value)} error={err.end} /></Field>
          </div>
          <div className="form-actions">
            {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setV(BLANK); setErr({}); }}>Болих</button>}
            <button className="btn pri" type="submit" data-testid="submit">Хадгалах</button>
          </div>
        </form>
      </div>
    </main>
  );
}
