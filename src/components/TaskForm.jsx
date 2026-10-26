import { useEffect, useState } from 'react';
import { Field, Input, Segmented, ErrorBanner, KIND, STATUS } from './ui.jsx';
import { validateTask } from '../lib/validate.js';
import { TODAY } from '../lib/dates.js';

export default function TaskForm({ initial, mode = 'new', onSubmit, onCancel, onChange, extra }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));
  useEffect(() => { onChange?.(v); }, [v]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    const er = validateTask(v, { today: TODAY, allowPast: mode === 'edit' });
    setErr(er);
    setServerErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 120));
    const res = await onSubmit({ ...v, estimatedMinutes: Number(v.estimatedMinutes), actualMinutes: Number(v.actualMinutes || 0) });
    setBusy(false);
    if (res?.error) setServerErr(res.error);
  };

  return (
    <form className="card form" onSubmit={submit} noValidate data-testid="task-form">
      <ErrorBanner>{serverErr}</ErrorBanner>
      <Field label="Даалгаврын нэр" name="title" error={err.title}>
        <Input name="title" value={v.title} onChange={(e) => set('title', e.target.value)} error={err.title} placeholder="Жишээ: Өгөгдлийн сангийн лаб 3" />
      </Field>
      <div className="row">
        <Field label="Хичээл" name="course"><Input name="course" value={v.course} onChange={(e) => set('course', e.target.value)} /></Field>
        <Field label="Deadline" name="deadline" error={err.deadline}>
          <Input name="deadline" type="date" value={v.deadline} onChange={(e) => set('deadline', e.target.value)} error={err.deadline} />
        </Field>
      </div>
      <Field label="Төрөл" name="kind">
        <select id="kind" name="kind" data-testid="field-kind" value={v.kind} onChange={(e) => set('kind', e.target.value)}>
          {Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </Field>
      <Field label="Ач холбогдол (priority)" name="priority" error={err.priority}>
        <Segmented name="priority" value={v.priority} onChange={(x) => set('priority', x)} options={[['high', 'Өндөр'], ['med', 'Дунд'], ['low', 'Бага']]} />
      </Field>
      <div className="row">
        <Field label="Зарцуулах хугацаа (минут)" name="estimatedMinutes" error={err.estimatedMinutes}>
          <Input name="estimatedMinutes" type="number" inputMode="numeric" value={v.estimatedMinutes} onChange={(e) => set('estimatedMinutes', e.target.value)} error={err.estimatedMinutes} />
        </Field>
        {mode === 'edit' && (
          <Field label="Бодит хугацаа (минут)" name="actualMinutes">
            <Input name="actualMinutes" type="number" value={v.actualMinutes} onChange={(e) => set('actualMinutes', e.target.value)} />
          </Field>
        )}
      </div>
      <div className="chips">
        {[30, 60, 90, 120].map((m) => (
          <button type="button" key={m} className={'chip' + (Number(v.estimatedMinutes) === m ? ' on' : '')} onClick={() => set('estimatedMinutes', String(m))}>{m}</button>
        ))}
      </div>
      {mode === 'edit' && (
        <Field label="Төлөв" name="status">
          <Segmented name="status" value={v.status} onChange={(x) => set('status', x)} options={Object.entries(STATUS)} />
        </Field>
      )}
      <Field label="Тэмдэглэл (заавал биш)" name="notes">
        <textarea id="notes" name="notes" data-testid="field-notes" rows={2} value={v.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      {extra}
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Болих</button>
        <button type="submit" className="btn pri" disabled={busy} data-testid="submit">{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button>
      </div>
    </form>
  );
}
