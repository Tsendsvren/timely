import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import { PageHeader, EmptyState, ErrorBanner } from '../components/ui.jsx';
import Avatar from '../components/Avatar.jsx';

const TABS = [['all', 'Бүгд'], ['clothes', 'Хувцас'], ['color', 'Өнгө'], ['accessory', 'Хэрэгсэл']];

export default function Shop() {
  const { data, profile, actions } = useApp();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const items = data.shopItems
    .filter((i) => i.isActive)
    .filter((i) => tab === 'all' || i.type === tab)
    .filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()));
  const equipped = profile.equipped.map((id) => data.shopItems.find((i) => i.id === id)).filter(Boolean);
  const selected = data.shopItems.find((i) => i.id === sel);
  const previewItems = selected ? [...equipped.filter((e) => e.type !== selected.type), selected] : equipped;
  const cost = selected && !profile.owned.includes(selected.id) ? selected.pricePoints : 0;

  const buy = (id) => {
    const r = actions.buyItem(id);
    setError(r.error || '');
    setOk(r.ok ? 'Амжилттай худалдаж авлаа' : '');
  };

  return (
    <main className="page" data-testid="page-shop">
      <PageHeader title="Аватарын дэлгүүр" sub="Цуглуулсан оноогоороо Timely аватартаа хувцас, өнгө авна">
        <Link className="btn ghost" to="/profile">Аватар тохируулах</Link>
      </PageHeader>
      <ErrorBanner>{error}</ErrorBanner>
      {ok && <p className="notice" role="status" data-testid="shop-ok">{ok}</p>}
      <div className="two-col wide-left">
        <div className="stack">
          <div className="between wrap">
            <div className="chips" role="tablist" aria-label="Ангилал">
              {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={'chip' + (tab === k ? ' on' : '')} data-testid={`tab-${k}`} onClick={() => setTab(k)}>{l}</button>)}
            </div>
            <input type="search" placeholder="Бараа хайх…" aria-label="Бараа хайх" data-testid="shop-search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {items.length === 0 ? <EmptyState title="Бараа олдсонгүй" /> : (
            <ul className="shop-grid" data-testid="shop-grid">
              {items.map((i) => {
                const owned = profile.owned.includes(i.id);
                const afford = profile.points >= i.pricePoints;
                return (
                  <li key={i.id} className={'card item' + (sel === i.id ? ' selected' : '')} data-testid="shop-item">
                    <button className="thumb" aria-label={`${i.name} урьдчилж харах`} onClick={() => setSel(i.id)}><Avatar items={[i]} size={86} /></button>
                    <strong>{i.name}</strong>
                    <span className="price">★ {i.pricePoints}</span>
                    {owned ? <span className="btn soft sm" data-testid="owned">✓ Өмссөн/Авсан</span>
                      : <button className={'btn sm ' + (afford ? 'pri' : 'ghost')} disabled={!afford} data-testid={`buy-${i.id}`} onClick={() => buy(i.id)}>{afford ? 'Авах' : 'Оноо хүрэхгүй'}</button>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <aside className="card center" aria-label="Урьдчилж харах">
          <h2>Урьдчилж харах</h2>
          <div className="stage"><Avatar items={previewItems} size={160} /></div>
          <div className="metric"><span>Үлдэгдэл</span><strong data-testid="balance">{profile.points}</strong></div>
          <div className="metric"><span>Сонгосон</span><strong>−{cost}</strong></div>
          <div className="metric"><span>Үлдэх</span><strong>{profile.points - cost}</strong></div>
        </aside>
      </div>
    </main>
  );
}
