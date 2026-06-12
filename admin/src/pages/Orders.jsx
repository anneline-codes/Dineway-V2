import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  confirmed: { bg: '#dbeafe', color: '#1e40af' },
  preparing: { bg: '#fef9c3', color: '#854d0e' },
  delivered: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const STATUSES = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const load = () =>
    api.get('/orders/restaurant')
      .then(({ data }) => setOrders(data.data.orders || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    if (user?.restaurantId) socket.emit('join:restaurant', user.restaurantId);
    socket.on('order:new', ({ order }) => {
      setOrders(prev => [order, ...prev]);
      toast('🛎️ New order!', { style: { background: '#fff', color: '#C9A84C', border: '1px solid #C9A84C' } });
    });
    socket.on('order:updated', ({ order }) =>
      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, ...order } : o))
    );
    return () => socket.disconnect();
  }, [user?.restaurantId]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
    } catch { toast.error('Update failed'); }
  };

  const fmt = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' , ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  };

  if (loading) return <div style={{ color: '#888', padding: 24 }}>Loading orders...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Orders</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>View and manage recent customer orders.</p>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dd', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #eee' }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>Recent Orders</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Order ID', 'Customer', 'Items', 'Total', 'Order Time', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 24px', color: '#888', fontWeight: 500, fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '14px 24px', color: '#C9A84C', fontWeight: 600, fontSize: 13 }}>{o.orderId}</td>
                <td style={{ padding: '14px 24px', color: '#1a1a1a' }}>{o.clientId?.name || '—'}</td>
                <td style={{ padding: '14px 24px', color: '#1a1a1a', fontWeight: 600 }}>
                  {o.items?.length || 0} {o.items?.length === 1 ? 'item' : 'items'}
                </td>
                <td style={{ padding: '14px 24px', color: '#1a1a1a', fontWeight: 600 }}>${o.totalAmount || 0}</td>
                <td style={{ padding: '14px 24px', color: '#888' }}>{fmt(o.createdAt)}</td>
                <td style={{ padding: '14px 24px' }}>
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o._id, e.target.value)}
                    style={{
                      background: '#f5f5f5', border: '1px solid #ddd',
                      borderRadius: 6, padding: '5px 10px',
                      fontSize: 12, color: '#333', outline: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px 24px', textAlign: 'center', color: '#aaa' }}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
