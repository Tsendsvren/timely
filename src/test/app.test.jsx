import { describe, it, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderApp } from './helpers.jsx';
import { routes } from '../routes.js';

describe('routing & role', () => {
  it.each(routes.filter((r) => r.access === 'member'))('оюутан $path -> $testId', ({ path, testId }) => {
    renderApp(path.replace(':id', 'T01'), 'U01');
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
  it('/authenticate зочинд нээгдэнэ', () => {
    renderApp('/authenticate', null);
    expect(screen.getByTestId('page-authenticate')).toBeInTheDocument();
  });
  it('админ /admin/shop нээнэ', () => {
    renderApp('/admin/shop', 'U99');
    expect(screen.getByTestId('page-admin-shop')).toBeInTheDocument();
  });
  it('зочин хамгаалагдсан route-оос /authenticate руу шилжинэ', () => {
    renderApp('/planner', null);
    expect(screen.getByTestId('page-authenticate')).toBeInTheDocument();
  });
  it('оюутан /admin/shop руу орвол нүүр рүү буцна', () => {
    renderApp('/admin/shop', 'U01');
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();
  });
  it('мэдэгдэхгүй route -> 404', () => {
    renderApp('/nowhere', 'U01');
    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
  });
  it('мобайл цэс нээгдэнэ', async () => {
    renderApp('/', 'U01');
    await userEvent.click(screen.getByTestId('menu-toggle'));
    expect(screen.getByTestId('sidebar')).toHaveClass('open');
  });
});

describe('authenticate', () => {
  it('validation алдаа харуулна', async () => {
    renderApp('/authenticate', null);
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('error-email')).toHaveTextContent('Имэйл хаяг буруу байна');
    expect(screen.getByTestId('error-password')).toBeInTheDocument();
  });
  it('буруу нууц үг -> алдаа', async () => {
    renderApp('/authenticate', null);
    await userEvent.type(screen.getByTestId('field-email'), 'bolormaa@must.edu.mn');
    await userEvent.type(screen.getByTestId('field-password'), 'WrongPass1');
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('error-banner')).toHaveTextContent('буруу');
  });
  it('нэвтэрч dashboard руу очно', async () => {
    renderApp('/authenticate', null);
    await userEvent.type(screen.getByTestId('field-email'), 'bolormaa@must.edu.mn');
    await userEvent.type(screen.getByTestId('field-password'), 'Secret123');
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('page-dashboard')).toBeInTheDocument();
  });
  it('бүртгэлтэй имэйлээр signup -> алдаа', async () => {
    renderApp('/authenticate', null);
    await userEvent.click(screen.getByTestId('auth-mode-signup'));
    await userEvent.type(screen.getByTestId('field-name'), 'Бат');
    await userEvent.type(screen.getByTestId('field-email'), 'bolormaa@must.edu.mn');
    await userEvent.type(screen.getByTestId('field-password'), 'Secret123');
    await userEvent.type(screen.getByTestId('field-confirm'), 'Secret123');
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('error-email')).toHaveTextContent('бүртгэлтэй');
  });
  it('админ нэвтэрвэл admin эрхтэй цэс харагдана', async () => {
    renderApp('/authenticate', null);
    await userEvent.type(screen.getByTestId('field-email'), 'admin@must.edu.mn');
    await userEvent.type(screen.getByTestId('field-password'), 'Admin1234');
    await userEvent.click(screen.getByTestId('submit'));
    await screen.findByTestId('page-dashboard');
    expect(screen.getByRole('link', { name: 'Админ: Дэлгүүр' })).toBeInTheDocument();
  });
});

describe('task CRUD (mock)', () => {
  it('хоосон гарчигт талбарын алдаа', async () => {
    renderApp('/tasks/new');
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('error-title')).toHaveTextContent('Гарчиг заавал оруулна уу');
    expect(screen.getByTestId('error-deadline')).toBeInTheDocument();
  });
  it('нэмэх -> харах -> засах -> устгах', async () => {
    renderApp('/tasks/new');
    await userEvent.type(screen.getByTestId('field-title'), 'Шинэ лаб тайлан');
    await userEvent.type(screen.getByTestId('field-deadline'), '2026-10-28');
    await userEvent.click(screen.getByTestId('submit'));
    // Create -> Read
    expect(await screen.findByTestId('page-planner')).toBeInTheDocument();
    await userEvent.type(screen.getByTestId('task-search'), 'Шинэ лаб');
    const item = within(screen.getByTestId('task-list')).getByTestId('task-item');
    expect(item).toHaveTextContent('Шинэ лаб тайлан');
    // Update
    await userEvent.click(item);
    expect(screen.getByTestId('page-task-edit')).toBeInTheDocument();
    const title = screen.getByTestId('field-title');
    await userEvent.clear(title);
    await userEvent.type(title, 'Засварласан лаб');
    await userEvent.click(screen.getByTestId('priority-high'));
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('saved-msg')).toBeInTheDocument();
    // Delete
    await userEvent.click(screen.getByTestId('delete'));
    await userEvent.click(screen.getByTestId('confirm-delete'));
    expect(await screen.findByTestId('page-planner')).toBeInTheDocument();
    await userEvent.type(screen.getByTestId('task-search'), 'Засварласан');
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
  it('байхгүй даалгавар -> олдсонгүй', () => {
    renderApp('/tasks/NOPE');
    expect(screen.getByText('Даалгавар олдсонгүй')).toBeInTheDocument();
  });
  it('хоцорсон блокыг шилжүүлнэ', async () => {
    renderApp('/tasks/T01');
    await userEvent.click(screen.getByTestId('reschedule'));
    expect(await screen.findByTestId('reschedule-msg')).toHaveTextContent('Шилжүүллээ');
    expect(screen.getByText('Хоцорсон блок алга.')).toBeInTheDocument();
  });
  it('жагсаалтын хайлт, шүүлт, хуудаслалт', async () => {
    renderApp('/planner');
    expect(within(screen.getByTestId('task-list')).getAllByTestId('task-item')).toHaveLength(4);
    await userEvent.selectOptions(screen.getByTestId('task-status-filter'), 'completed');
    expect(within(screen.getByTestId('task-list')).getAllByTestId('task-item')).toHaveLength(1);
    expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 1');
  });
});

describe('commitments', () => {
  it('validation, нэмэх, устгах', async () => {
    renderApp('/commitments');
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('error-title')).toBeInTheDocument();
    expect(screen.getByTestId('error-days')).toHaveTextContent('Дор хаяж нэг өдөр');
    await userEvent.type(screen.getByTestId('field-title'), 'Бокс');
    await userEvent.click(screen.getByTestId('day-2'));
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('commit-msg')).toHaveTextContent('нэмэгдлээ');
    expect(screen.getAllByTestId('commitment-item')).toHaveLength(5);
    await userEvent.click(screen.getByRole('button', { name: 'Бокс устгах' }));
    expect(screen.getAllByTestId('commitment-item')).toHaveLength(4);
  });
});

describe('focus timer', () => {
  it('даалгавар сонгоогүй үед Start идэвхгүй, Stop нь оноо өгнө', async () => {
    renderApp('/focus-timer');
    expect(screen.getByTestId('start')).toBeDisabled();
    await userEvent.selectOptions(screen.getByTestId('task-select'), 'T03');
    await userEvent.click(screen.getByTestId('start'));
    await userEvent.click(screen.getByTestId('demo-add'));
    expect(screen.getByTestId('timer-display')).toHaveTextContent('10:00');
    expect(screen.getByTestId('points-preview')).toHaveTextContent('+10');
    await userEvent.click(screen.getByTestId('stop'));
    expect(await screen.findByTestId('page-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('points-chip')).toHaveTextContent('1,260');
  });
});

describe('grades & GPA', () => {
  it('What-if: 62 + 24 = 86 (B+)', () => {
    renderApp('/grades');
    expect(screen.getByTestId('total')).toHaveTextContent('86');
    expect(screen.getByTestId('letter')).toHaveTextContent('B+');
  });
  it('оноо дээд хязгаараас хэтэрвэл алдаа, хадгалахгүй', async () => {
    renderApp('/grades');
    const quiz = screen.getByTestId('field-quiz');
    await userEvent.clear(quiz);
    await userEvent.type(quiz, '31');
    await userEvent.click(screen.getByTestId('save-grade'));
    expect(screen.getByTestId('error-quiz')).toHaveTextContent('0–30');
    expect(screen.queryByTestId('grade-msg')).not.toBeInTheDocument();
  });
  it('GPA: одоогийн голч ба зорилт', async () => {
    renderApp('/gpa-goal');
    expect(screen.getByTestId('current-gpa')).toHaveTextContent('3.43');
    const t = screen.getByTestId('target');
    await userEvent.clear(t);
    await userEvent.type(t, '4');
    expect(await screen.findByTestId('infeasible')).toBeInTheDocument();
    await userEvent.clear(t);
    await userEvent.type(t, '4.5');
    await userEvent.click(screen.getByTestId('save-gpa'));
    expect(screen.getByTestId('error-target')).toBeInTheDocument();
  });
});

describe('shop, profile, admin', () => {
  it('оноо хүрэлцвэл худалдан авна, дараа нь хүрэхгүй бол товч идэвхгүй', async () => {
    renderApp('/gamification/shop');
    expect(screen.getByTestId('buy-S03')).toBeEnabled();
    await userEvent.click(screen.getByTestId('buy-S05'));
    expect(await screen.findByTestId('shop-ok')).toBeInTheDocument();
    expect(screen.getByTestId('balance')).toHaveTextContent('50');
    expect(screen.getByTestId('buy-S03')).toBeDisabled();
    expect(screen.getByTestId('buy-S08')).toHaveTextContent('Оноо хүрэхгүй');
  });
  it('ангиллаар шүүнэ', async () => {
    renderApp('/gamification/shop');
    await userEvent.click(screen.getByTestId('tab-color'));
    expect(screen.getAllByTestId('shop-item')).toHaveLength(3);
  });
  it('профайл: validation, өмсөх', async () => {
    renderApp('/profile');
    const email = screen.getByTestId('field-email');
    await userEvent.clear(email);
    await userEvent.type(email, 'bad');
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('error-email')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('equip-S02'));
    expect(screen.getByTestId('equip-S02')).toHaveAttribute('aria-pressed', 'true');
  });
  it('админ: үнэ 0 -> алдаа, нэмэх, устгах', async () => {
    renderApp('/admin/shop', 'U99');
    await userEvent.type(screen.getByTestId('field-name'), 'Шар малгай');
    await userEvent.type(screen.getByTestId('field-pricePoints'), '0');
    await userEvent.click(screen.getByTestId('submit'));
    expect(screen.getByTestId('error-pricePoints')).toHaveTextContent('Үнэ 0-ээс их байна');
    await userEvent.clear(screen.getByTestId('field-pricePoints'));
    await userEvent.type(screen.getByTestId('field-pricePoints'), '250');
    await userEvent.click(screen.getByTestId('submit'));
    expect(await screen.findByTestId('admin-msg')).toBeInTheDocument();
    expect(screen.getByTestId('stat-items')).toHaveTextContent('9');
    await userEvent.type(screen.getByTestId('admin-search'), 'Шар');
    await userEvent.click(screen.getByRole('button', { name: 'Шар малгай устгах' }));
    await userEvent.click(screen.getByTestId('confirm-delete'));
    expect(screen.getByTestId('stat-items')).toHaveTextContent('8');
  });
  it('админ жагсаалтын хуудаслалт', async () => {
    renderApp('/admin/shop', 'U99');
    expect(screen.getByTestId('page-info')).toHaveTextContent('1 / 2');
    await userEvent.click(screen.getByTestId('page-next'));
    await waitFor(() => expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 2'));
  });
});

describe('mock-only', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  it('src дотор /api/ руу хүсэлт илгээх код байхгүй', () => {
    const files = walk('src').filter((f) => /\.(jsx?|mjs)$/.test(f) && !/\.test\./.test(f) && !f.includes('test/'));
    const bad = files.filter((f) => /fetch\(|axios|XMLHttpRequest|['"`]\/api\//.test(readFileSync(f, 'utf8')));
    expect(bad).toEqual([]);
  });
});
