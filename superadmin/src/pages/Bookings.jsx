import { useState, useEffect, useCallback } from 'react';
import { Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function Bookings() {
  const [data, setData] = useState({ bookings: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/bookings/all?${params}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    socket.emit('join:superadmin');
    socket.on('booking:new', () => load());
    socket.on('booking:updated', () => load());
    return () => socket.disconnect();
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/bookings/${id}/status`, { status }); load(); }
    catch { toast.error('Update failed'); }
  };

  const badgeStyle = (s) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s === 'confirmed' ? '#E6F4EA' : s === 'cancelled' ? '#FEE2E2' : '#FFF9E6',
    color: s === 'confirmed' ? '#38a169' : s === 'cancelled' ? '#e53e3e' : '#d69e2e',
    textTransform: 'capitalize',
  });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Bookings</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Platform-wide booking management.</div>
        </div>
        <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select style={{ ...inputStyle, width: 150 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
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
              {['Customer', 'Venue', 'Date', 'Time', 'Guests', 'Status', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>Loading...</td></tr>
                : data.bookings?.length === 0 ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>No bookings found</td></tr>
                  : data.bookings?.map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{b.clientId?.name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{b.venueId?.name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{b.time || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{b.guests}</td>
                      <td style={{ padding: '10px 12px' }}><span style={badgeStyle(b.status)}>{b.status}</span></td>
                      <td style={{ padding: '10px 12px' }}>
                        <select style={{ ...inputStyle, width: 115, padding: '4px 8px', fontSize: 12 }}
                          value={b.status} onChange={e => updateStatus(b._id, e.target.value)}>
                          {['pending', 'confirmed', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
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
