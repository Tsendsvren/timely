import { useState } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, Field, Input, Segmented, Badge } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';
import { validateShopItem } from '../lib/validate.js';

const TYPES = { clothes: ['Хувцас', 'amb'], color: ['Өнгө', 'pri'], accessory: ['Хэрэгсэл', 'blu'] };
const BLANK = { name: '', type: 'clothes', pricePoints: '', color: '#6D5DF6' };
const PAGE_SIZE = 5;

const lookOf = (v) => (v.type === 'color' ? { color: v.color } : v.type === 'clothes' ? { hat: v.color } : { glasses: true });

export default function AdminShop() {
  const { data, actions } = useApp();
  const [v, setV] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState({});
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const all = data.shopItems.filter((i) => i.isActive);
  const filtered = all.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const activeUsers = data.users.filter((u) => u.role === 'member').length;

  const submit = (e) => {
    e.preventDefault();
    const er = validateShopItem(v);
    setErr(er); setMsg('');
    if (Object.keys(er).length) return;
    const payload = { ...v, look: lookOf(v) };
    const r = editId ? actions.updateShopItem(editId, payload) : actions.addShopItem(payload);
    if (r.error) { setErr({ [r.field || 'name']: r.error }); return; }
    setMsg(editId ? 'Өөрчлөлт хадгалагдлаа' : 'Дэлгүүрт нэмэгдлээ');
    setV(BLANK); setEditId(null);
  };
  const edit = (i) => { setEditId(i.id); setV({ name: i.name, type: i.type, pricePoints: String(i.pricePoints), color: i.look.color || i.look.hat || '#6D5DF6' }); setErr({}); setMsg(''); };

  return (
    <main className="page" data-testid="page-admin-shop">
      <PageHeader title="Дэлгүүр удирдах (Админ)" sub="ShopItem CRUD · аватарын хувцас, өнгө, хэрэгсэл" />
      <div className="stats">
        <div className="card stat"><span className="muted sm">Нийт бараа</span><strong data-testid="stat-items">{all.length}</strong></div>
        <div className="card stat"><span className="muted sm">Борлуулалт</span><strong>{data.purchases}</strong></div>
        <div className="card stat"><span className="muted sm">Идэвхтэй хэрэглэгч</span><strong>{activeUsers}</strong></div>
      </div>
      <div className="two-col wide-left">
        <section className="card" aria-labelledby="it">
          <div className="between wrap">
            <h2 id="it">Бараанууд</h2>
            <input type="search" placeholder="Нэрээр хайх…" aria-label="Бараа хайх" data-testid="admin-search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          {filtered.length === 0 ? <EmptyState title="Бараа алга." /> : (
            <>
              <ul className="list" data-testid="admin-items">
                {shown.map((i) => (
                  <li key={i.id} className="row-item" data-testid="admin-item">
                    <Avatar items={[i]} size={44} />
                    <div className="grow"><strong>{i.name}</strong><p className="muted sm">★ {i.pricePoints}</p></div>
                    <Badge tone={TYPES[i.type][1]}>{TYPES[i.type][0]}</Badge>
                    <button className="btn ghost sm" aria-label={`${i.name} засах`} onClick={() => edit(i)}>Засах</button>
                    {confirmId === i.id ? (
                      <span className="confirm"><button className="btn danger sm" data-testid="confirm-delete" onClick={() => { actions.deleteShopItem(i.id); setConfirmId(null); }}>Тийм</button><button className="btn ghost sm" onClick={() => setConfirmId(null)}>Үгүй</button></span>
                    ) : <button className="btn ghost sm" aria-label={`${i.name} устгах`} onClick={() => setConfirmId(i.id)}>Устгах</button>}
                  </li>
                ))}
              </ul>
              <div className="pager">
                <button className="btn ghost sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)} data-testid="page-prev">←</button>
                <span className="muted sm" data-testid="page-info">{cur} / {pages}</span>
                <button className="btn ghost sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)} data-testid="page-next">→</button>
              </div>
            </>
          )}
        </section>
        <form className="card form" onSubmit={submit} noValidate data-testid="shop-form">
          <h2>{editId ? 'Бараа засах' : 'Шинэ бараа нэмэх'}</h2>
          {msg && <p className="notice" role="status" data-testid="admin-msg">{msg}</p>}
          <Field label="Нэр" name="name" error={err.name}><Input name="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={err.name} placeholder="Жишээ: Шар малгай" /></Field>
          <Field label="Төрөл" name="type" error={err.type}>
            <Segmented name="type" value={v.type} onChange={(x) => setV({ ...v, type: x })} options={[['clothes', 'Хувцас'], ['color', 'Өнгө'], ['accessory', 'Хэрэгсэл']]} />
          </Field>
          <Field label="Үнэ (оноо)" name="pricePoints" error={err.pricePoints}><Input name="pricePoints" type="number" value={v.pricePoints} onChange={(e) => setV({ ...v, pricePoints: e.target.value })} error={err.pricePoints} /></Field>
          <Field label="Өнгө" name="color"><input id="color" type="color" value={v.color} onChange={(e) => setV({ ...v, color: e.target.value })} /></Field>
          <div className="stage small"><Avatar items={[{ look: lookOf(v) }]} size={90} /></div>
          <div className="form-actions">
            {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setV(BLANK); setErr({}); }}>Болих</button>}
            <button className="btn pri" type="submit" data-testid="submit">{editId ? 'Хадгалах' : 'Дэлгүүрт нэмэх'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
