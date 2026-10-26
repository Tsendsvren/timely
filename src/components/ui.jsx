export function Field({ label, name, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="error" role="alert" data-testid={`error-${name}`}>{error}</p>}
    </div>
  );
}

export const Input = ({ name, error, ...p }) => (
  <input id={name} name={name} data-testid={`field-${name}`} aria-invalid={error ? 'true' : undefined} {...p} />
);

export function PageHeader({ title, sub, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      <div className="actions">{children}</div>
    </header>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty" data-testid="empty-state">
      <p><strong>{title}</strong></p>
      {children}
    </div>
  );
}

export function ErrorBanner({ children, onRetry }) {
  if (!children) return null;
  return (
    <div className="banner-error" role="alert" data-testid="error-banner">
      <span>{children}</span>
      {onRetry && <button type="button" className="btn ghost sm" onClick={onRetry}>Дахин оролдох</button>}
    </div>
  );
}

export function Segmented({ options, value, onChange, name }) {
  return (
    <div className="segmented" role="group" aria-label={name}>
      {options.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={value === v} className={value === v ? 'on' : ''} data-testid={`${name}-${v}`} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, max = 100, tone = 'pri' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className="progress" aria-hidden="true"><span className={tone} style={{ width: pct + '%' }} /></div>;
}

export const PRIORITY = { high: ['Өндөр', 'red'], med: ['Дунд', 'amb'], low: ['Бага', 'grn'] };
export const STATUS = { pending: 'Хүлээгдэж буй', completed: 'Дууссан', rescheduled: 'Шилжүүлсэн' };
export const KIND = { assignment: 'Бие даалт', lab: 'Лаборатори', exam: 'Шалгалт', quiz: 'Сорил' };
export const CTYPE = { job: ['Ажил', 'amb'], club: ['Клуб', 'blu'], habit: ['Дадал', 'grn'] };

export const Badge = ({ tone = 'pri', children }) => <span className={`badge ${tone}`}>{children}</span>;
