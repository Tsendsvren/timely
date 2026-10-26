import { useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Field } from '../components/ui.jsx';
import { currentGPA, requiredAverage } from '../lib/gpaCalc.js';
import { validateSemester, validateTarget } from '../lib/validate.js';

export default function GpaGoal() {
  const { mine, profile, actions } = useApp();
  const [rows, setRows] = useState(() => mine.semesters.map((s, i) => ({ semester: i + 1, gpa: s ? String(s.gpa) : '', credits: s ? String(s.credits) : '' })));
  const [target, setTarget] = useState(String(profile.gpaTarget));
  const [errs, setErrs] = useState({});
  const [tErr, setTErr] = useState(null);
  const [msg, setMsg] = useState('');

  const entered = rows.filter((r) => r.gpa !== '' || r.credits !== '');
  const parsed = rows.filter((r) => r.gpa !== '' && r.credits !== '' && Object.keys(validateSemester(r)).length === 0).map((r) => ({ semester: r.semester, gpa: Number(r.gpa), credits: Number(r.credits) }));
  const targetOk = !validateTarget(target);
  const cur = currentGPA(parsed);
  const req = targetOk ? requiredAverage(parsed, Number(target)) : null;

  const setRow = (i, k, val) => { setRows((p) => p.map((r, j) => (j === i ? { ...r, [k]: val } : r))); setMsg(''); };
  const save = () => {
    const e = {};
    rows.forEach((r, i) => { if (r.gpa !== '' || r.credits !== '') { const er = validateSemester(r); if (Object.keys(er).length) e[i] = er; } });
    const te = validateTarget(target);
    setErrs(e); setTErr(te);
    if (Object.keys(e).length || te) return;
    actions.saveGpa(rows.map((r) => (r.gpa === '' ? null : { semester: r.semester, gpa: Number(r.gpa), credits: Number(r.credits) })), target);
    setMsg('Хадгалагдлаа');
  };

  return (
    <main className="page" data-testid="page-gpa-goal">
      <PageHeader title="Голч (GPA) зорилго" sub="8 улирлын дүнг оруулж зорилтот голчид хүрэх оноог тооцоол" />
      <div className="stats">
        <div className="card stat"><span className="muted sm">Одоогийн голч</span><strong data-testid="current-gpa">{cur.count ? cur.gpa.toFixed(2) : '—'}</strong><span className="muted sm">{cur.count} улирал · {cur.credits} кр</span></div>
        <div className="card stat"><span className="muted sm">Зорилтот голч</span><strong>{targetOk ? Number(target).toFixed(2) : '—'}</strong><span className="muted sm">8 улирлын эцэст</span></div>
        <div className="card stat"><span className="muted sm">Үлдсэн улирал</span><strong>{8 - cur.count}</strong></div>
      </div>
      <div className="two-col wide-left">
        <section className="card" aria-labelledby="sem">
          <h2 id="sem">Улирал бүрийн голч</h2>
          {entered.length === 0 && <EmptyState title="Эхний улирлын дүнгээ оруулна уу" />}
          <div className="chart" data-testid="gpa-chart">
            {rows.map((r) => {
              const ok = r.gpa !== '' && !Number.isNaN(Number(r.gpa));
              const val = ok ? Number(r.gpa) : req?.required && req.remaining ? Math.min(4, req.required) : 0;
              return (
                <div key={r.semester} className="col">
                  <span className="sm">{val ? val.toFixed(2) : ''}</span>
                  <span className={'colbar' + (ok ? ' today' : ' ghostbar')} style={{ height: (val / 4) * 130 + 'px' }} />
                  <span className="muted sm">{r.semester}-р</span>
                </div>
              );
            })}
          </div>
          <div className="sem-grid">
            {rows.map((r, i) => (
              <div key={r.semester} className="sem-row">
                <strong>{r.semester}-р улирал</strong>
                <Field label="Голч" name={`gpa-${i}`} error={errs[i]?.gpa}>
                  <input id={`gpa-${i}`} data-testid={`gpa-${i}`} type="number" step="0.01" value={r.gpa} onChange={(e) => setRow(i, 'gpa', e.target.value)} />
                </Field>
                <Field label="Кредит" name={`cr-${i}`} error={errs[i]?.credits}>
                  <input id={`cr-${i}`} data-testid={`cr-${i}`} type="number" value={r.credits} onChange={(e) => setRow(i, 'credits', e.target.value)} />
                </Field>
              </div>
            ))}
          </div>
          <div className="form-actions">{msg && <span className="notice" role="status" data-testid="gpa-msg">{msg}</span>}<button className="btn pri" onClick={save} data-testid="save-gpa">Хадгалах</button></div>
        </section>
        <div className="stack">
          <section className="card" aria-labelledby="tg">
            <h2 id="tg">Зорилтот голч</h2>
            <Field label="0–4.0" name="target" error={tErr}>
              <input id="target" data-testid="target" type="number" step="0.05" value={target} onChange={(e) => { setTarget(e.target.value); setMsg(''); }} />
            </Field>
            <input type="range" min="0" max="4" step="0.05" aria-label="Зорилтот голчийн слайдер" value={targetOk ? target : 0} onChange={(e) => setTarget(e.target.value)} />
          </section>
          <section className={'card ' + (req && !req.feasible ? 'warn' : 'tint')} aria-labelledby="rq" data-testid="required-card">
            <h2 id="rq">Үлдсэн {req?.remaining ?? '—'} улиралд</h2>
            {req && req.required !== null ? (
              <>
                <strong className="big" data-testid="required">{req.required.toFixed(2)}</strong>
                <p className="muted">дундаж голч авах шаардлагатай</p>
                {!req.feasible && <p className="error" role="alert" data-testid="infeasible">Энэ зорилтод хүрэх боломжгүй байна, зорилтоо бууруулна уу.</p>}
              </>
            ) : <p className="muted">Зөв зорилт оруулна уу.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
