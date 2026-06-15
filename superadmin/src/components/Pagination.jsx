export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1);
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1} style={btnStyle(false)}>‹</button>
      {nums.map(n => (
        <button key={n} onClick={() => onPage(n)} style={btnStyle(page === n)}>{n}</button>
      ))}
      {pages > 5 && <span style={{ color: '#a0aec0', fontSize: 12 }}>...</span>}
      <button onClick={() => onPage(page + 1)} disabled={page === pages} style={btnStyle(false)}>›</button>
    </div>
  );
}
const btnStyle = (active) => ({
  padding: '5px 10px', borderRadius: 6,
  border: `1px solid ${active ? '#C9A84C' : '#e2e8f0'}`,
  background: active ? '#C9A84C' : '#fff',
  color: active ? '#fff' : '#4a5568',
  fontSize: 12, cursor: 'pointer', fontWeight: active ? 600 : 400,
});
