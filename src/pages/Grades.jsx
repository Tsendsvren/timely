import { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Field, Input, Progress } from '../components/ui.jsx';
import { calcGrade, neededExam } from '../lib/gradeCalc.js';
import { validateBreakdown, validateCourse, GRADE_MAX } from '../lib/validate.js';

export default function Grades() {
  const { mine, actions } = useApp();
  const [id, setId] = useState(mine.grades[0]?.id || '');
  const g = mine.grades.find((x) => x.id === id) || mine.grades[0];
  const [b, setB] = useState(null);
  const [exam, setExam] = useState(24);
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState('');
  const [add, setAdd] = useState({ courseName: '', credits: '3' });
  const [addErr, setAddErr] = useState({});

  useEffect(() => {
    if (g) { setB({ attendance: g.attendance, lab: g.lab, quiz: g.quiz }); setExam(g.exam ?? 24); setErr({}); setMsg(''); }
  }, [g?.id]); // eslint-disable-line

  const submitAdd = (e) => {
    e.preventDefault();
    const er = validateCourse(add);
    setAddErr(er);
    if (Object.keys(er).length) return;
    const r = actions.addGrade(add);
    if (r.error) { setAddErr({ [r.field || 'courseName']: r.error }); return; }
    setId(r.grade.id); setAdd({ courseName: '', credits: '3' });
  };

  const save = () => {
    const er = validateBreakdown({ ...b, exam });
    setErr(er);
    if (Object.keys(er).length) return;
    actions.updateGrade(g.id, { attendance: Number(b.attendance), lab: Number(b.lab), quiz: Number(b.quiz), exam: Number(exam) });
    setMsg('Хадгалагдлаа');
  };

  const valid = b && Object.keys(validateBreakdown({ ...b, exam })).length === 0;
  const res = valid ? calcGrade(b, exam) : null;

  return (
    <main className="page" data-testid="page-grades">
      <PageHeader title='Дүнгийн "What-if" тооцоолуур' sub="Хичээл бүрийн 70 оноо (ирц, лаб, сорил) + 30 оноо (шалгалт)">
        {mine.grades.length > 0 && (
          <select aria-label="Хичээл сонгох" data-testid="course-select" value={g?.id} onChange={(e) => setId(e.target.value)}>
            {mine.grades.map((x) => <option key={x.id} value={x.id}>{x.courseName} · {x.credits} кр</option>)}
          </select>
        )}
      </PageHeader>
      <div className="two-col wide-left">
        <div className="stack">
          {!g || !b ? (
            <EmptyState title="Хичээл нэмээгүй байна">Доорх маягтаар эхний хичээлээ нэмнэ үү.</EmptyState>
          ) : (
            <section className="card form" aria-labelledby="bd">
              <div className="between"><h2 id="bd">70 онооны задаргаа — {g.courseName}</h2><button className="btn ghost sm" onClick={() => { actions.deleteGrade(g.id); setId(''); }} data-testid="delete-course">Хичээл устгах</button></div>
              {err.breakdown && <p className="error" role="alert" data-testid="error-breakdown">{err.breakdown}</p>}
              {[['attendance', 'Ирц'], ['lab', 'Лабораторийн ажил'], ['quiz', 'Сорил / Бие даалт']].map(([k, l]) => (
                <div key={k} className="grade-row">
                  <Field label={`${l} (дээд ${GRADE_MAX[k]})`} name={k} error={err[k]}>
                    <Input name={k} type="number" value={b[k]} onChange={(e) => { setB({ ...b, [k]: e.target.value }); setMsg(''); }} error={err[k]} />
                  </Field>
                  <Progress value={Number(b[k]) || 0} max={GRADE_MAX[k]} />
                </div>
              ))}
              <div className="whatif">
                <div className="between"><strong>30 онооны шалгалт — таамаглал</strong><span><strong data-testid="exam-value">{exam}</strong> / 30</span></div>
                <input type="range" min="0" max="30" value={exam} aria-label="Шалгалтын оноо" data-testid="exam-slider" onChange={(e) => setExam(Number(e.target.value))} />
                {err.exam && <p className="error" role="alert">{err.exam}</p>}
              </div>
              <div className="form-actions">
                {msg && <span className="notice" role="status" data-testid="grade-msg">{msg}</span>}
                <button className="btn pri" onClick={save} data-testid="save-grade">Хадгалах</button>
              </div>
            </section>
          )}
          <form className="card form" onSubmit={submitAdd} noValidate data-testid="course-form">
            <h2>Хичээл нэмэх</h2>
            <div className="row">
              <Field label="Хичээлийн нэр" name="courseName" error={addErr.courseName}><Input name="courseName" value={add.courseName} onChange={(e) => setAdd({ ...add, courseName: e.target.value })} error={addErr.courseName} /></Field>
              <Field label="Кредит" name="credits" error={addErr.credits}><Input name="credits" type="number" value={add.credits} onChange={(e) => setAdd({ ...add, credits: e.target.value })} error={addErr.credits} /></Field>
            </div>
            <div className="form-actions"><button className="btn pri" type="submit">Нэмэх</button></div>
          </form>
        </div>
        <div className="stack">
          <section className="card center total" aria-label="Нийт дүн">
            <span className="muted sm">Нийт дүн (таамаглал)</span>
            <strong className="big" data-testid="total">{res ? res.total : '—'}</strong>
            <span className="badge pri" data-testid="letter">{res ? `Үсгэн дүн: ${res.letter} · ${res.gradePoint.toFixed(1)}` : 'Оноогоо шалгана уу'}</span>
          </section>
          {b && (
            <section className="card" aria-labelledby="nd">
              <h2 id="nd">Зорилтот дүнд хүрэхэд</h2>
              <ul className="list" data-testid="needed">
                {neededExam(b).filter((n) => ['A', 'B+', 'B', 'C+'].includes(n.letter)).map((n) => (
                  <li key={n.letter} className="row-item"><strong>{n.letter} ({n.min}+)</strong><span className="grow" /><span>{n.possible ? `Шалгалтаас ${n.exam} / 30` : 'Боломжгүй'}</span></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
