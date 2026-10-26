import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <main className="page" data-testid="page-not-found">
      <EmptyState title="Хуудас олдсонгүй"><Link className="btn pri sm" to="/">Нүүр хуудас руу</Link></EmptyState>
    </main>
  );
}
