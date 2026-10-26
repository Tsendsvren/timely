import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext.jsx';
import Avatar from './Avatar.jsx';

const MEMBER_NAV = [
  ['/', 'Dashboard'], ['/planner', 'Цаг төлөвлөгч'], ['/tasks/new', 'Даалгавар нэмэх'], ['/commitments', 'Гадуурх ачаалал'],
  ['/focus-timer', 'Focus Timer'], ['/grades', 'Дүн (What-if)'], ['/gpa-goal', 'GPA зорилго'],
  ['/gamification/shop', 'Аватарын дэлгүүр'], ['/profile', 'Профайл'],
];
const ADMIN_NAV = [['/', 'Dashboard'], ['/admin/shop', 'Админ: Дэлгүүр'], ['/profile', 'Профайл']];

export default function Layout() {
  const { user, profile, data, actions } = useApp();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  if (!user) return <Navigate to="/authenticate" replace />;
  const items = user.role === 'admin' ? ADMIN_NAV : MEMBER_NAV;
  const equipped = (profile?.equipped || []).map((id) => data.shopItems.find((i) => i.id === id)).filter(Boolean);

  return (
    <div className="shell">
      <div className="topbar">
        <button className="btn ghost sm" aria-label="Цэс" aria-expanded={open} data-testid="menu-toggle" onClick={() => setOpen((o) => !o)}>☰ Цэс</button>
        <strong>Timely</strong>
        {user.role === 'member' && <span className="points" data-testid="points-chip-mobile">★ {profile.points.toLocaleString('en-US')}</span>}
      </div>
      <aside className={'sidebar' + (open ? ' open' : '')} data-testid="sidebar">
        <div className="logo"><span className="mark">T</span> Timely</div>
        <nav aria-label="Үндсэн цэс">
          {items.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => 'nav' + (isActive ? ' active' : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <div className="usercard">
          <Avatar items={equipped} size={40} />
          <div>
            <strong data-testid="user-name">{user.name}</strong>
            <p className="muted sm">{user.role === 'admin' ? 'role: admin' : 'Оюутан · member'}</p>
          </div>
        </div>
        <button className="btn ghost sm" data-testid="logout" onClick={() => { actions.logout(); nav('/authenticate'); }}>Гарах</button>
      </aside>
      <div className="main">
        {user.role === 'member' && (
          <div className="points-bar"><span className="points" data-testid="points-chip">★ {profile.points.toLocaleString('en-US')} оноо</span></div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
