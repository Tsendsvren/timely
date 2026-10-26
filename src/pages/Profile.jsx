import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Field, Input, ErrorBanner } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { validateProfile } from '../lib/validate.js';

export default function Profile() {
  const { user, profile, data, actions } = useApp();
  const nav = useNavigate();
  const [v, setV] = useState({ name: user.name, email: user.email });
  const [err, setErr] = useState({});
  const [serverErr, setServerErr] = useState('');
  const [msg, setMsg] = useState('');
  const equipped = profile.equipped.map((id) => data.shopItems.find((i) => i.id === id)).filter(Boolean);
  const owned = profile.owned.map((id) => data.shopItems.find((i) => i.id === id)).filter(Boolean);

  const submit = (e) => {
    e.preventDefault();
    const er = validateProfile(v);
    setErr(er); setServerErr(''); setMsg('');
    if (Object.keys(er).length) return;
    const r = actions.updateProfile(v);
    if (r.error) { r.field ? setErr({ [r.field]: r.error }) : setServerErr(r.error); return; }
    setMsg('Хадгалагдлаа');
  };

  return (
    <main className="page" data-testid="page-profile">
      <PageHeader title="Профайл & Аватар тохиргоо" sub="Хувийн мэдээллээ засаж, худалдаж авсан хувцсаа өмсүүлнэ" />
      <div className="two-col">
        <form className="card form" onSubmit={submit} noValidate data-testid="profile-form">
          <h2>Хувийн мэдээлэл</h2>
          <ErrorBanner>{serverErr}</ErrorBanner>
          {msg && <p className="notice" role="status" data-testid="profile-msg">{msg}</p>}
          <Field label="Нэр" name="name" error={err.name}><Input name="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.name} /></Field>
          <Field label="Имэйл" name="email" error={err.email}><Input name="email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={err.email} /></Field>
          <Field label="Эрх (role)" name="role"><input id="role" value={user.role} disabled readOnly /></Field>
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={() => { actions.logout(); nav('/authenticate'); }}>Гарах</button>
            <button className="btn pri" type="submit" data-testid="submit">Хадгалах</button>
          </div>
        </form>
        <div className="stack">
          <section className="card center" aria-label="Аватар">
            <div className="stage"><Avatar items={equipped} size={170} /></div>
            <p className="muted sm">Одоо өмсөж буй: {equipped.length ? equipped.map((i) => i.name).join(', ') : 'юу ч үгүй'}</p>
          </section>
          <section className="card" aria-labelledby="ow">
            <h2 id="ow">Худалдаж авсан зүйлс</h2>
            {owned.length === 0 ? (
              <EmptyState title="Одоогоор зүйл алга">Дэлгүүрээс оноогоор хувцас аваарай.</EmptyState>
            ) : (
              <ul className="list" data-testid="owned-list">
                {owned.map((i) => {
                  const on = profile.equipped.includes(i.id);
                  return (
                    <li key={i.id} className="row-item">
                      <Avatar items={[i]} size={40} />
                      <div className="grow"><strong>{i.name}</strong></div>
                      <button className={'btn sm ' + (on ? 'soft' : 'ghost')} aria-pressed={on} data-testid={`equip-${i.id}`} onClick={() => actions.toggleEquip(i.id)}>{on ? '✓ Өмссөн' : 'Өмсөх'}</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
