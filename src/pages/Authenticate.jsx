import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { Field, Input, ErrorBanner, Segmented } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { validateAuth } from '../lib/validate.js';

export default function Authenticate() {
  const { user, actions } = useApp();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [v, setV] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const er = validateAuth(v, mode);
    setErr(er);
    setServerErr('');
    if (Object.keys(er).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 120));
    const res = mode === 'login' ? actions.login(v.email, v.password) : actions.signup(v);
    setBusy(false);
    if (res.error) {
      if (res.field) setErr({ [res.field]: res.error });
      else setServerErr(res.error);
      return;
    }
    nav('/', { replace: true });
  };

  return (
    <main className="auth" data-testid="page-authenticate">
      <section className="hero">
        <div className="logo"><span className="mark light">T</span> Timely</div>
        <h1>Цагаа ухаалгаар төлөвлө, амжилтаа өсгө</h1>
        <p>Хичээл, бие даалт, гадуурх ачааллаа нэг дор удирд. Сул цагт Study block санал болгож, Focus Timer-ээр оноо цуглуулна.</p>
        <ul>
          <li>Ухаалаг Study block санал болгоно</li>
          <li>Focus Timer + оноо, аватарын дэлгүүр</li>
          <li>Дүн болон 8 улирлын GPA тооцоолуур</li>
        </ul>
        <Avatar size={140} items={[{ look: { color: '#FFFFFF', hat: '#F5A524' } }]} />
      </section>
      <section className="auth-form">
        <h2>Тавтай морил</h2>
        <p className="muted">Бүртгэлээрээ нэвтэрч төлөвлөгөөгөө үргэлжлүүлээрэй.</p>
        <Segmented name="auth-mode" value={mode} onChange={(m) => { setMode(m); setErr({}); setServerErr(''); }} options={[['login', 'Нэвтрэх'], ['signup', 'Бүртгүүлэх']]} />
        <form onSubmit={submit} noValidate data-testid="auth-form">
          <ErrorBanner>{serverErr}</ErrorBanner>
          {mode === 'signup' && (
            <Field label="Нэр" name="name" error={err.name}><Input name="name" value={v.name} onChange={set('name')} error={err.name} autoComplete="name" /></Field>
          )}
          <Field label="Имэйл" name="email" error={err.email}><Input name="email" type="email" value={v.email} onChange={set('email')} error={err.email} autoComplete="email" /></Field>
          <Field label="Нууц үг" name="password" error={err.password}><Input name="password" type="password" value={v.password} onChange={set('password')} error={err.password} autoComplete="current-password" /></Field>
          {mode === 'signup' && (
            <Field label="Нууц үг давтах" name="confirm" error={err.confirm}><Input name="confirm" type="password" value={v.confirm} onChange={set('confirm')} error={err.confirm} autoComplete="new-password" /></Field>
          )}
          <button type="submit" className="btn pri block" disabled={busy} data-testid="submit">
            {busy ? 'Түр хүлээнэ үү…' : mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>
        </form>
        <p className="muted sm demo">Демо: bolormaa@must.edu.mn / Secret123 (оюутан) · admin@must.edu.mn / Admin1234 (админ)</p>
      </section>
    </main>
  );
}
