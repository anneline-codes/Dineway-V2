import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { Settings, ArrowUp } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

/* ─── Design tokens ──────────────────────────────────────── */
const T = {
  bg: '#0D0D0D',
  card: '#1A1A1A',
  input: '#222222',
  gold: '#C9A84C',
  white: '#FFFFFF',
  muted: '#888888',
  border: '#2A2A2A',
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
};

const STATUS_META = {
  available: { color: T.green, label: 'Available' },
  reserved:  { color: T.yellow, label: 'Reserved' },
  occupied:  { color: T.red, label: 'Occupied' },
};

/* ─── Add Table Modal ────────────────────────────────────── */
function AddTableModal({ restaurantId, onClose, onAdded }) {
  const [form, setForm] = useState({
    tableNumber: '', capacity: 4, section: 'Main Hall', shape: 'square',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tableNumber.trim()) return toast.error('Table number required');
    setLoading(true);
    try {
      await api.post('/tables', { ...form, restaurantId, capacity: Number(form.capacity) });
      toast.success('Table added');
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add table');
    } finally {
      setLoading(false);
    }
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modal = {
    background: T.card, borderRadius: 12, padding: 28,
    width: 380, maxWidth: '90vw', border: `1px solid ${T.border}`,
  };
  const inputStyle = {
    width: '100%', background: T.input, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '10px 14px', color: T.white, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <h3 style={{ color: T.white, fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Add Table</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: T.muted, fontSize: 13, display: 'block', marginBottom: 6 }}>Table Number / ID</label>
            <input style={inputStyle} value={form.tableNumber}
              onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
              placeholder="e.g. T1, B3" />
          </div>
          <div>
            <label style={{ color: T.muted, fontSize: 13, display: 'block', marginBottom: 6 }}>Seats</label>
            <input style={inputStyle} type="number" min={1} max={50} value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
          </div>
          <div>
            <label style={{ color: T.muted, fontSize: 13, display: 'block', marginBottom: 6 }}>Section</label>
            <input style={inputStyle} value={form.section}
              onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
              placeholder="Main Hall, Terrace..." />
          </div>
          <div>
            <label style={{ color: T.muted, fontSize: 13, display: 'block', marginBottom: 6 }}>Shape</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.shape} onChange={e => setForm(f => ({ ...f, shape: e.target.value }))}>
              <option value="square">Square</option>
              <option value="circle">Circle / Booth</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose}
              style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 20px', color: T.muted, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ background: T.gold, border: 'none', borderRadius: 8, padding: '10px 20px', color: '#000', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : 'Add Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Table Card ─────────────────────────────────────────── */
function TableCard({ table, onClick }) {
  const meta = STATUS_META[table.status] || STATUS_META.available;
  const isCircle = table.shape === 'circle';

  const cardStyle = {
    background: '#1C1A14',
    border: `1px solid #2a2a1a`,
    borderRadius: isCircle ? '50%' : 16,
    width: isCircle ? 100 : 108,
    height: isCircle ? 100 : 108,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    cursor: table.status === 'available' ? 'pointer' : 'default',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    flexShrink: 0,
    padding: 8,
  };

  return (
    <div
      style={cardStyle}
      onClick={() => table.status === 'available' && onClick(table)}
      onMouseEnter={e => { if (table.status === 'available') { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.boxShadow = `0 0 12px ${T.gold}44`; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a1a'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <span style={{ color: T.white, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        {table.tableNumber}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: T.muted }}>👥</span>
        <span style={{ fontSize: 11, color: T.muted }}>{table.capacity} Seats</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
        <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
      </div>
    </div>
  );
}

/* ─── Main Bookings Page ─────────────────────────────────── */
export default function Bookings() {
  const { user } = useAuthStore();
  const [tables, setTables] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const restaurantId = user?.restaurantId;

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const { data } = await api.get(`/bookings/tables/${restaurantId}`);
      setTables(data.data || []);
    } catch {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadTables();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    if (restaurantId) socket.emit('join:restaurant', restaurantId);

    socket.on('booking:new', ({ booking }) => {
      // Update table status to reserved
      if (booking.tableId?._id || booking.tableId) {
        const tId = booking.tableId?._id || booking.tableId;
        setTables(prev => prev.map(t =>
          t._id === tId ? { ...t, status: 'reserved' } : t
        ));
      }
      toast('📅 New booking received!', {
        style: { background: T.card, color: T.gold, border: `1px solid ${T.gold}` },
      });
    });

    socket.on('table:created', ({ table }) => setTables(prev => [...prev, table]));
    socket.on('table:updated', ({ table }) => setTables(prev => prev.map(t => t._id === table._id ? table : t)));

    return () => socket.disconnect();
  }, [restaurantId, loadTables]);

  const counts = {
    all: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
  };

  const visibleTables = filter === 'all' ? tables : tables.filter(t => t.status === filter);

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'available', label: `Available (${counts.available})`, dot: T.green },
    { key: 'reserved', label: `Reserved (${counts.reserved})`, dot: T.yellow },
    { key: 'occupied', label: `Occupied (${counts.occupied})`, dot: T.red },
  ];

  const steps = [
    { n: 1, label: 'Select Date & Time' },
    { n: 2, label: 'Select Table' },
    { n: 3, label: 'Reservation Details' },
    { n: 4, label: 'Your Reservation is confirmed' },
  ];

  if (loading) return (
    <div style={{ color: T.muted, padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      Loading table map...
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button
          onClick={() => setSelectedTable('new')}
          style={{
            background: T.gold, border: 'none', borderRadius: 50,
            padding: '10px 22px', color: '#000', fontWeight: 700,
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Make a reservation
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Filter tabs */}
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: filter === tab.key ? T.gold : T.card,
                border: `1px solid ${filter === tab.key ? T.gold : T.border}`,
                borderRadius: 50, padding: '7px 14px',
                color: filter === tab.key ? '#000' : T.white,
                fontWeight: filter === tab.key ? 700 : 400,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {tab.dot && <div style={{ width: 7, height: 7, borderRadius: '50%', background: tab.dot }} />}
              {tab.label}
            </button>
          ))}

          {/* Add Table */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: `1px solid ${T.gold}`,
              borderRadius: 50, padding: '7px 16px',
              color: T.gold, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            <Settings size={14} color={T.gold} />
            Add Table
          </button>
        </div>
      </div>

      {/* Main layout: left sidebar + right map */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Left panel: steps */}
        <div style={{
          background: T.card, borderRadius: 12, padding: '20px 22px',
          minWidth: 220, flexShrink: 0,
        }}>
          <p style={{ color: T.gold, fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            To Make A New Reservation
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <span style={{ color: T.white, fontSize: 14, lineHeight: '28px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: table map */}
        <div style={{
          flex: 1, background: T.card, borderRadius: 12,
          padding: 24, position: 'relative',
        }}>
          {visibleTables.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.muted, padding: 40 }}>
              No tables found.
            </div>
          ) : (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16,
              alignItems: 'center', justifyContent: 'flex-start',
            }}>
              {visibleTables.map(table => (
                <TableCard
                  key={table._id}
                  table={table}
                  onClick={t => setSelectedTable(t)}
                />
              ))}
            </div>
          )}

          {/* Main Entrance landmark */}
          <div style={{
            textAlign: 'center', marginTop: 32, color: T.muted, fontSize: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <ArrowUp size={16} color={T.muted} />
            <span>Main Entrance</span>
          </div>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <AddTableModal
          restaurantId={restaurantId}
          onClose={() => setShowAddModal(false)}
          onAdded={loadTables}
        />
      )}

      {/* Reservation flow modal triggered by clicking available table or "Make a reservation" */}
      {selectedTable && (
        <ReservationModal
          table={selectedTable === 'new' ? null : selectedTable}
          restaurantId={restaurantId}
          onClose={() => setSelectedTable(null)}
          onConfirmed={() => { setSelectedTable(null); loadTables(); }}
        />
      )}
    </div>
  );
}

/* ─── Inline 4-step reservation modal (admin) ────────────── */
import {
  ChevronLeft, Calendar, Clock, Armchair, Minus, Plus, Check, CalendarDays,
} from 'lucide-react';
import {
  format, addDays, isBefore, startOfDay, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay, addMonths, subMonths,
} from 'date-fns';

function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      {[1, 2, 3, 4].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: step === s ? T.gold : T.bg,
            border: `2px solid ${step === s ? T.gold : '#555'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14,
            color: step === s ? '#000' : T.white, flexShrink: 0,
          }}>{s}</div>
          {i < 3 && <div style={{ width: 44, height: 2, background: T.border }} />}
        </div>
      ))}
    </div>
  );
}

function CalendarPicker({ selected, onSelect }) {
  const [viewDate, setViewDate] = useState(selected ? new Date(selected) : new Date());
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);
  const firstDay = startOfMonth(viewDate);
  const lastDay = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startPad = getDay(firstDay);
  const paddedDays = [...Array(startPad).fill(null), ...days];
  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ background: T.bg, borderRadius: 10, padding: 14, flex: 1, minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setViewDate(v => subMonths(v, 1))} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18, padding: '2px 6px' }}>‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: T.gold, fontWeight: 700, fontSize: 14 }}>{format(viewDate, 'MMMM yyyy')}</span>
          <CalendarDays size={14} color={T.muted} />
        </div>
        <button onClick={() => setViewDate(v => addMonths(v, 1))} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18, padding: '2px 6px' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
        {weekLabels.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, color: T.muted, padding: '3px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`p${i}`} />;
          const isDisabled = isBefore(day, today) || isBefore(maxDate, day);
          const isSelected = selected && format(day, 'yyyy-MM-dd') === selected;
          return (
            <button key={day.toISOString()} disabled={isDisabled} onClick={() => onSelect(format(day, 'yyyy-MM-dd'))}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '50%',
                background: isSelected ? T.gold : 'transparent', border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isDisabled ? '#444' : isSelected ? '#000' : T.white,
                fontWeight: isSelected ? 700 : 400, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function slotToTime24(slot) {
  if (!slot) return '';
  const match = slot.match(/^(\d+):(\d+)(AM|PM)$/i);
  if (!match) return slot;
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}`;
}
function addTwoHours(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const nh = h + 2;
  return nh >= 24 ? '' : `${String(nh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function formatDisplayTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, '0')}${period}`;
}

const DEFAULT_SLOTS = ['09:00AM','10:00AM','11:00AM','12:00PM','01:00PM','02:00PM','03:00PM','06:00PM','07:00PM','08:00PM'];

function ReservationModal({ table, restaurantId, onClose, onConfirmed }) {
  const [step, setStep] = useState(table ? 2 : 1);
  const [form, setForm] = useState({
    date: '', timeSlot: '', section: '',
    tableId: table?._id || '',
    name: '', phone: '', guests: 2, notes: '',
  });
  const [tables, setTables] = useState(table ? [table] : []);
  const [sections, setSections] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    api.get(`/tables/sections/${restaurantId}`)
      .then(r => { const s = r.data.data || []; setSections(s); if (s.length) setForm(f => ({ ...f, section: s[0] })); })
      .catch(() => {});
  }, [restaurantId]);

  const fetchAvailableTables = useCallback(async () => {
    if (!form.date || !form.timeSlot) { setTables([]); return; }
    setLoadingTables(true);
    try {
      const t24 = slotToTime24(form.timeSlot);
      const params = { restaurantId, date: form.date, timeSlot: t24 };
      if (form.section) params.section = form.section;
      const r = await api.get('/tables/available', { params });
      setTables(r.data.data || []);
    } catch { setTables([]); } finally { setLoadingTables(false); }
  }, [form.date, form.timeSlot, form.section, restaurantId]);

  useEffect(() => { if (step === 2 && !table) fetchAvailableTables(); }, [form.date, form.timeSlot, form.section, step]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const t24 = slotToTime24(form.timeSlot);
      const end = addTwoHours(t24);
      const { data } = await api.post('/reservations', {
        restaurantId, tableId: form.tableId,
        date: form.date, timeSlot: t24, startTime: t24, endTime: end,
        guestCount: form.guests, guestName: form.name, guestPhone: form.phone, notes: form.notes,
      });
      setCreated(data.data);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create reservation');
    } finally { setSubmitting(false); }
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 };
  const modal = { background: T.card, borderRadius: 12, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${T.border}`, fontFamily: 'Inter, system-ui, sans-serif' };
  const inputStyle = { width: '100%', background: T.input, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 14px', color: T.white, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const goldBtn = { width: '100%', background: T.gold, border: 'none', borderRadius: 50, padding: '13px 0', color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 18, fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : onClose()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.white, display: 'flex' }}>
            <ChevronLeft size={20} color={T.white} />
          </button>
          <span style={{ color: T.white, fontWeight: 700, fontSize: 17 }}>
            {step === 4 ? 'Reservation Confirmed' : 'New Reservation'}
          </span>
        </div>

        <div style={{ marginBottom: 22 }}><StepIndicator step={step} /></div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ color: T.white, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Select Date &amp; Time</div>
                <CalendarPicker selected={form.date} onSelect={d => setForm(f => ({ ...f, date: d }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                {DEFAULT_SLOTS.map(slot => {
                  const isSel = form.timeSlot === slot;
                  return (
                    <button key={slot} onClick={() => setForm(f => ({ ...f, timeSlot: slot }))}
                      style={{ background: isSel ? T.gold : T.bg, border: `1px solid ${isSel ? T.gold : T.border}`, borderRadius: 50, padding: '8px 16px', color: isSel ? '#000' : T.white, fontWeight: isSel ? 700 : 400, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
            <button style={{ ...goldBtn, opacity: !form.date || !form.timeSlot ? 0.5 : 1 }} disabled={!form.date || !form.timeSlot} onClick={() => setStep(2)}>Next</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: T.white, fontWeight: 700, fontSize: 17 }}>Select Table</span>
              {sections.length > 1 && (
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value, tableId: '' }))}
                  style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 50, padding: '5px 12px', color: T.white, fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
              <span style={{ color: T.white, fontSize: 13 }}>Available Tables</span>
            </div>
            {loadingTables ? (
              <div style={{ textAlign: 'center', padding: 24, color: T.muted }}>Loading...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 6 }}>
                {tables.map(t => {
                  const isSel = form.tableId === t._id;
                  return (
                    <button key={t._id} onClick={() => setForm(f => ({ ...f, tableId: t._id }))}
                      style={{ background: isSel ? T.gold : T.input, border: `1px solid ${isSel ? T.gold : T.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
                      <span style={{ color: isSel ? '#000' : T.white, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>#TABLE {t.tableNumber}</span>
                    </button>
                  );
                })}
                {tables.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: T.muted, padding: 20 }}>No available tables.</div>}
              </div>
            )}
            <button style={{ ...goldBtn, opacity: !form.tableId ? 0.5 : 1 }} disabled={!form.tableId} onClick={() => setStep(3)}>Next</button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 17, marginBottom: 18 }}>Reservation Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ color: T.muted, fontSize: 12, display: 'block', marginBottom: 5 }}>Name</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Joe Daniels" />
              </div>
              <div>
                <label style={{ color: T.muted, fontSize: 12, display: 'block', marginBottom: 5 }}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+250 789 345 727" />
              </div>
              <div>
                <label style={{ color: T.muted, fontSize: 12, display: 'block', marginBottom: 5 }}>Guests</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: T.input, borderRadius: 8, padding: '8px 16px', border: `1px solid ${T.border}`, width: 'fit-content' }}>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, display: 'flex' }}><Minus size={16} color={T.gold} /></button>
                  <span style={{ color: T.white, fontWeight: 700, fontSize: 17, minWidth: 18, textAlign: 'center' }}>{form.guests}</span>
                  <button onClick={() => setForm(f => ({ ...f, guests: Math.min(50, f.guests + 1) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, display: 'flex' }}><Plus size={16} color={T.gold} /></button>
                </div>
              </div>
              <div>
                <label style={{ color: T.muted, fontSize: 12, display: 'block', marginBottom: 5 }}>Special Request</label>
                <textarea style={{ ...inputStyle, height: 90, resize: 'none' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Near the window please..." />
              </div>
            </div>
            <button style={goldBtn} disabled={submitting} onClick={handleSubmit}>{submitting ? 'Confirming...' : 'Next'}</button>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && created && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', border: `3px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={30} color={T.gold} strokeWidth={2.5} />
            </div>
            <h3 style={{ color: T.white, fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>Your Reservation is confirmed!</h3>
            <p style={{ color: T.muted, fontSize: 12, margin: '0 0 4px' }}>Booking ID</p>
            <p style={{ color: T.white, fontWeight: 700, fontSize: 20, margin: '0 0 18px' }}>#{created.bookingId}</p>
            <div style={{ background: '#111', borderRadius: 10, border: `1px solid ${T.border}`, textAlign: 'left', overflow: 'hidden', marginBottom: 18 }}>
              {[
                { icon: <Calendar size={16} color={T.gold} />, label: 'Date', value: format(new Date(created.date), 'd MMM yyyy') },
                { icon: <Clock size={16} color={T.gold} />, label: 'Time', value: formatDisplayTime(created.startTime) + (created.endTime ? ` – ${formatDisplayTime(created.endTime)}` : '') },
                { icon: <Armchair size={16} color={T.gold} />, label: 'Table', value: `#TABLE ${created.tableId?.tableNumber || ''} (${created.tableId?.capacity || ''} seats)` },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  {row.icon}
                  <span style={{ color: T.white, fontSize: 13, flex: 1 }}>{row.label}</span>
                  <span style={{ color: T.muted, fontSize: 13 }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button style={{ ...goldBtn, marginTop: 0 }} onClick={onConfirmed}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
