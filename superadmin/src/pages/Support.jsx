import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const PRIORITY_COLORS = { low: '#38a169', medium: '#d69e2e', high: '#dd6b20', urgent: '#e53e3e' };

export default function Support() {
  const [data, setData] = useState({ tickets: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/support?${params}`)
      .then(r => setData({ tickets: r.data.data?.tickets || [], total: r.data.data?.total || 0 }))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const updateTicket = async (id, updates) => {
    try { await api.put(`/support/${id}`, updates); load(); }
    catch { toast.error('Update failed'); }
  };

  const badgeStyle = (s) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s === 'resolved' ? '#E6F4EA' : s === 'closed' ? '#f0f0f0' : s === 'in_progress' ? '#EBF8FF' : '#FFF9E6',
    color: s === 'resolved' ? '#38a169' : s === 'closed' ? '#718096' : s === 'in_progress' ? '#3182ce' : '#d69e2e',
    textTransform: 'capitalize',
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Support Tickets</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 150 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['open', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 140 }} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
          <option value="">All Priority</option>
          {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input placeholder="Search tickets..." onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 32, ...inputStyle, width: 220 }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            {['Ticket', 'Subject', 'User', 'Priority', 'Status', 'Date', 'Action'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={emptyCell}>Loading...</td></tr>
              : data.tickets.length === 0 ? <tr><td colSpan={7} style={emptyCell}>No tickets found</td></tr>
                : data.tickets.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#C9A84C' }}>{t.ticketId}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                    <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{t.userName || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[t.priority] || '#718096', textTransform: 'capitalize' }}>{t.priority}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}><span style={badgeStyle(t.status)}>{t.status?.replace('_', ' ')}</span></td>
                    <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12 }}>
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <select style={{ ...inputStyle, width: 120, padding: '4px 8px', fontSize: 12 }}
                        value={t.status} onChange={e => updateTicket(t._id, { status: e.target.value })}>
                        {['open', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Total: {data.total}</span>
          <Pagination page={filters.page} pages={Math.ceil((data.total || 0) / 20) || 1} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const emptyCell = { padding: 36, textAlign: 'center', color: '#a0aec0', fontSize: 13 };
