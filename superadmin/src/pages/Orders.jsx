import { useState, useEffect, useCallback } from 'react';
import { Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const STATUS_COLORS = {
  pending: { bg: '#FFF9E6', color: '#d69e2e' },
  confirmed: { bg: '#EBF8FF', color: '#3182ce' },
  preparing: { bg: '#FFFAF0', color: '#dd6b20' },
  delivered: { bg: '#E6F4EA', color: '#38a169' },
  cancelled: { bg: '#FEE2E2', color: '#e53e3e' },
};

export default function Orders() {
  const [data, setData] = useState({ orders: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/orders?${params}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    socket.emit('join:superadmin');
    socket.on('order:new', () => load());
    socket.on('order:updated', () => load());
    return () => socket.disconnect();
  }, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/orders/${id}/status`, { status }); load(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Orders</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Platform-wide order management.</div>
        </div>
        <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 150 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input placeholder="Search orders..." onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 32, ...inputStyle, width: 220 }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              {['Order ID', 'Customer', 'Restaurant', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>Loading...</td></tr>
                : data.orders?.length === 0 ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>No orders found</td></tr>
                  : data.orders?.map(o => {
                    const sc = STATUS_COLORS[o.status] || { bg: '#f0f0f0', color: '#718096' };
                    return (
                      <tr key={o._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>{o._id?.slice(-8).toUpperCase()}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>{o.clientId?.name || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{o.restaurantId?.name || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#C9A84C', fontWeight: 600, fontSize: 13 }}>${o.totalAmount || 0}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>{o.status}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12 }}>
                          {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <select style={{ ...inputStyle, width: 120, padding: '4px 8px', fontSize: 12 }}
                            value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                            {['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
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
