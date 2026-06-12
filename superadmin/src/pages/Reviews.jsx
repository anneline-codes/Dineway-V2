import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function Reviews() {
  const [data, setData] = useState({ reviews: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'pending', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/reviews/moderation?${params}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, status) => {
    try {
      await api.patch(`/reviews/${id}/moderate`, { status });
      toast.success(status === 'approved' ? 'Review approved' : 'Review rejected');
      load();
    } catch { toast.error('Update failed'); }
  };

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? '#C9A84C' : '#e2e8f0', fontSize: 14 }}>★</span>
  ));

  const badgeStyle = (s) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s === 'approved' ? '#E6F4EA' : s === 'rejected' ? '#FEE2E2' : '#FFF9E6',
    color: s === 'approved' ? '#38a169' : s === 'rejected' ? '#e53e3e' : '#d69e2e',
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Reviews</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Moderate client reviews before they go live.</div>
        </div>
        <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilters(f => ({ ...f, status: s, page: 1 }))}
            style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${filters.status === s ? '#C9A84C' : '#e2e8f0'}`, background: filters.status === s ? '#C9A84C' : '#fff', color: filters.status === s ? '#fff' : '#4a5568', fontSize: 12, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input placeholder="Search..." onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 32, ...inputStyle, width: 220 }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              {['Reviewer', 'Venue', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>Loading...</td></tr>
                : data.reviews?.length === 0 ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>No reviews to moderate</td></tr>
                  : data.reviews?.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{r.clientId?.name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{r.venueId?.name || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><div style={{ display: 'flex' }}>{stars(r.rating)}</div></td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12 }}>
                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px' }}><span style={badgeStyle(r.status)}>{r.status}</span></td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {r.status !== 'approved' && (
                            <button onClick={() => moderate(r._id, 'approved')} style={{ padding: '4px 10px', background: '#E6F4EA', color: '#38a169', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                          )}
                          {r.status !== 'rejected' && (
                            <button onClick={() => moderate(r._id, 'rejected')} style={{ padding: '4px 10px', background: '#FEE2E2', color: '#e53e3e', border: 'none', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Total: {data.total || 0}</span>
          <Pagination page={filters.page} pages={Math.ceil((data.total || 0) / 20) || 1} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
