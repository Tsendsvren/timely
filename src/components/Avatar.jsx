export default function Avatar({ items = [], size = 120 }) {
  const look = items.reduce((a, i) => ({ ...a, ...i.look }), {});
  const body = look.color || '#6D5DF6';
  return (
    <svg role="img" aria-label="Timely аватар" viewBox="0 0 100 100" width={size} height={size} style={{ maxWidth: '100%' }}>
      <ellipse cx="50" cy="58" rx="40" ry="37" fill={body} />
      <ellipse cx="38" cy="50" rx="6" ry="7" fill="#fff" />
      <ellipse cx="62" cy="50" rx="6" ry="7" fill="#fff" />
      <circle cx="39.5" cy="52" r="3" fill="#1B1B2F" />
      <circle cx="63.5" cy="52" r="3" fill="#1B1B2F" />
      <ellipse cx="29" cy="63" rx="6" ry="3.5" fill="#FF9EC4" />
      <ellipse cx="71" cy="63" rx="6" ry="3.5" fill="#FF9EC4" />
      <path d="M42 64 Q50 72 58 64" stroke="#1B1B2F" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {look.hat && <rect x="32" y="14" width="36" height="13" rx="5" fill={look.hat} />}
      {look.crown && <polygon points="32,28 36,12 44,22 50,10 56,22 64,12 68,28" fill="#F5A524" />}
      {look.glasses && (
        <g stroke="#1B1B2F" strokeWidth="2">
          <rect x="29" y="44" width="16" height="12" rx="4" fill="#1B1B2F" />
          <rect x="55" y="44" width="16" height="12" rx="4" fill="#1B1B2F" />
          <line x1="45" y1="49" x2="55" y2="49" />
        </g>
      )}
    </svg>
  );
}
