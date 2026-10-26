import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './store/AppContext.jsx';
import Layout from './components/Layout.jsx';
import NotFound from './pages/NotFound.jsx';
import { routes } from './routes.js';

function Guard({ access, children }) {
  const { user } = useApp();
  const loc = useLocation();
  if (!user) return <Navigate to="/authenticate" replace state={{ from: loc.pathname }} />;
  if (access === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const guest = routes.find((r) => r.access === 'guest');
  const protectedRoutes = routes.filter((r) => r.access !== 'guest');
  return (
    <Routes>
      <Route path={guest.path} element={<guest.Page />} />
      <Route element={<Layout />}>
        {protectedRoutes.map(({ path, access, Page }) => (
          <Route key={path} path={path} element={<Guard access={access}><Page /></Guard>} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
