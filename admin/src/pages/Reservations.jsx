import { useEffect, useState } from 'react';
import { Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';

const STATUS_META = {
  confirmed: { bg: '#dcfce7', color: '#166534' },
  pending:   { bg: '#fef3c7', color: '#92400e' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  completed: { bg: '#dbeafe', color: '#1e40af' },
};

/* ─── Detail Modal ───────────────────────────────────────── */
function DetailModal({ booking, onClose, onStatusChange }) {
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${booking._id}/status`, { status });
      toast.success('Status updated');
      onStatusChange(booking._id, status);
      onClose();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const row = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '11px 0', borderBottom: '1px solid #f0ede8',
    }}>
      <span style={{ color: '#888', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#1a1a1a', fontSize: 13, fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  const startTime = booking.startTime || booking.time || '—';
  const endTime   = booking.endTime || '';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 28,
        width: '100%', maxWidth: 420, border: '1px solid #eee',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>Reservation Detail</h2>
            <p style={{ color: '#C9A84C', fontSize: 12, marginTop: 2 }}>#{booking.bookingId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#aaa" />
          </button>
        </div>

        {row('Guest Name',    booking.guestName || booking.clientId?.name)}
        {row('Phone',         booking.guestPhone || booking.clientId?.phone)}
        {row('Table',         booking.tableId ? `#TABLE ${booking.tableId.tableNumber} · ${booking.tableId.capacity} seats · ${booking.tableId.section || ''}` : '—')}
        {row('Date',          booking.date ? format(new Date(booking.date), 'EEEE, d MMM yyyy') : '—')}
        {row('Time',          endTime ? `${startTime} – ${endTime}` : startTime)}
        {row('Guests',        booking.guests ?? booking.guestCount)}
        {row('Notes',         booking.notes)}

        <div style={{ marginTop: 18 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Update Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #ddd', borderRadius: 8,
              fontSize: 13, outline: 'none',
              background: '#fafafa', fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            {['confirmed', 'pending', 'cancelled', 'completed'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <button
          onClick={save} disabled={saving}
          style={{
            width: '100%', marginTop: 16,
            background: '#C9A84C', border: 'none',
            borderRadius: 8, padding: '11px',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [detail, setDetail]     = useState(null);
  const [filter, setFilter]     = useState('all');
  const { user } = useAuthStore();

  const load = () =>
    api.get('/bookings/restaurant')
      .then(({ data }) => setBookings(data.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    if (user?.restaurantId) socket.emit('join:restaurant', user.restaurantId);
    socket.on('booking:new', ({ booking }) => {
      setBookings(prev => [booking, ...prev]);
      toast('📅 New reservation!', {
        style: { background: '#fff', color: '#C9A84C', border: '1px solid #C9A84C' },
      });
    });
    socket.on('booking:updated', ({ booking }) =>
      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, ...booking } : b))
    );
    return () => socket.disconnect();
  }, [user?.restaurantId]);

  const handleStatusChange = (id, status) =>
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    try { return format(new Date(dateStr), 'd MMM yyyy'); } catch { return '—'; }
  };

  const STATUS_FILTERS = ['all', 'confirmed', 'pending', 'cancelled', 'completed'];

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div style={{ color: '#888', padding: 24 }}>Loading reservations...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Reservations</h1>
        <p style={{ color: '#888', fontSize: 13 }}>All reservations made at your restaurant.</p>
      </div>

      {/* Filter tabs — same pill style as the rest of the app */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 50,
              border: `1px solid ${filter === f ? '#C9A84C' : '#ddd'}`,
              background: filter === f ? '#C9A84C' : '#fff',
              color: filter === f ? '#fff' : '#555',
              fontSize: 13, fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? `All (${bookings.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dd', overflow: 'hidden' }}>
        {/* Table header label */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #eee' }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>All Reservations</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Booking ID', 'Guest', 'Table', 'Date', 'Time', 'Guests', 'Status', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 20px',
                  color: '#aaa', fontWeight: 500, fontSize: 12,
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(b => {
              const meta = STATUS_META[b.status] || STATUS_META.pending;
              const startTime = b.startTime || b.time || '—';
              const endTime   = b.endTime ? ` – ${b.endTime}` : '';
              return (
                <tr key={b._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '14px 20px', color: '#C9A84C', fontWeight: 600, fontSize: 13 }}>
                    #{b.bookingId}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ fontWeight: 500, color: '#1a1a1a', fontSize: 13 }}>
                      {b.guestName || b.clientId?.name || 'Guest'}
                    </p>
                    {(b.guestPhone || b.clientId?.phone) && (
                      <p style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
                        {b.guestPhone || b.clientId?.phone}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#555', fontSize: 13 }}>
                    {b.tableId
                      ? <span>#{b.tableId.tableNumber} <span style={{ color: '#aaa' }}>· {b.tableId.capacity} seats</span></span>
                      : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#555', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {fmt(b.date)}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#555', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {startTime}{endTime}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#1a1a1a', fontWeight: 600, fontSize: 13 }}>
                    {b.guests ?? b.guestCount ?? '—'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 12px', borderRadius: 20,
                      background: meta.bg, color: meta.color,
                      fontSize: 11, fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => setDetail(b)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Eye size={16} color="#bbb" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '36px 24px', textAlign: 'center', color: '#aaa' }}>
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <DetailModal
          booking={detail}
          onClose={() => setDetail(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
