import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CalendarDays, Check,
  Calendar, Clock, Armchair, Minus, Plus,
} from 'lucide-react';
import { restaurantAPI, tableAPI, reservationAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  format, addDays, isBefore, startOfDay,
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths,
} from 'date-fns';

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
};

/* ─── Step progress indicator ────────────────────────────── */
function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      {[1, 2, 3, 4].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: step === s ? T.gold : T.card,
            border: `2px solid ${step === s ? T.gold : '#555'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16,
            color: step === s ? '#000' : T.white,
            flexShrink: 0,
          }}>{s}</div>
          {i < 3 && (
            <div style={{ width: 56, height: 2, background: T.border, flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Calendar ───────────────────────────────────────────── */
function CalendarPicker({ selected, onSelect }) {
  const [viewDate, setViewDate] = useState(selected ? new Date(selected) : new Date());
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  const firstDay = startOfMonth(viewDate);
  const lastDay = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Pad with empty days for the starting weekday
  const startPad = getDay(firstDay); // 0=Sun
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ background: T.card, borderRadius: 12, padding: 16, flex: 1, minWidth: 260 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          onClick={() => setViewDate(v => subMonths(v, 1))}
          style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}
        >‹</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: T.gold, fontWeight: 700, fontSize: 15 }}>
            {format(viewDate, 'MMMM yyyy')}
          </span>
          <CalendarDays size={16} color={T.muted} />
        </div>
        <button
          onClick={() => setViewDate(v => addMonths(v, 1))}
          style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18, padding: '4px 8px' }}
        >›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {weekLabels.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 12, color: T.muted, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const isPast = isBefore(day, today);
          const isFuture = isBefore(maxDate, day);
          const isDisabled = isPast || isFuture;
          const isSelected = selected && format(day, 'yyyy-MM-dd') === selected;

          return (
            <button
              key={day.toISOString()}
              disabled={isDisabled}
              onClick={() => onSelect(format(day, 'yyyy-MM-dd'))}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '50%',
                background: isSelected ? T.gold : 'transparent',
                border: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isDisabled ? '#444' : isSelected ? '#000' : T.white,
                fontWeight: isSelected ? 700 : 400,
                fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = '#333'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Time slots ─────────────────────────────────────────── */
function TimeSlotList({ slots, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
      {slots.map(slot => {
        const isSelected = selected === slot;
        return (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            style={{
              background: isSelected ? T.gold : T.card,
              border: `1px solid ${isSelected ? T.gold : T.border}`,
              borderRadius: 50, padding: '10px 20px',
              color: isSelected ? '#000' : T.white,
              fontWeight: isSelected ? 700 : 400,
              fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = T.gold; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = T.border; }}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────── */
function generateTimeSlots(openingHours) {
  // If we have opening hours for today, generate 1-hour slots
  if (openingHours) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[new Date().getDay()];
    const todayHours = openingHours[todayKey];
    if (todayHours?.isOpen && todayHours.open && todayHours.close) {
      const slots = [];
      let [h] = todayHours.open.split(':').map(Number);
      const [closeH] = todayHours.close.split(':').map(Number);
      while (h < closeH) {
        const label = h < 12
          ? `${String(h).padStart(2, '0')}:00AM`
          : h === 12
          ? '12:00PM'
          : `${String(h - 12).padStart(2, '0')}:00PM`;
        slots.push(label);
        h++;
      }
      return slots;
    }
  }
  // Default slots
  return ['09:00AM', '10:00AM', '11:00AM', '12:00PM', '01:00PM', '02:00PM', '03:00PM', '06:00PM', '07:00PM', '08:00PM'];
}

function slotToTime24(slot) {
  // Convert "12:00PM" -> "12:00"
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

function addHour(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const newH = h + 2; // 2-hour slot
  if (newH >= 24) return '';
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDisplayTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')}${period}`;
}

/* ─── Main Reservations Page ─────────────────────────────── */
const Reservations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [restaurants, setRestaurants] = useState([]);
  const [sections, setSections] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  const preselectedRestaurant = searchParams.get('restaurantId') || '';

  const [form, setForm] = useState({
    restaurantId: preselectedRestaurant,
    date: '',
    timeSlot: '',  // display slot e.g. "12:00PM"
    section: '',
    tableId: '',
    name: user?.name || '',
    phone: user?.phone || '',
    guests: 2,
    notes: '',
  });

  const selectedRestaurant = restaurants.find(r => r._id === form.restaurantId);
  const selectedTable = tables.find(t => t._id === form.tableId);
  const timeSlots = generateTimeSlots(selectedRestaurant?.openingHours);

  // Load restaurants
  useEffect(() => {
    restaurantAPI.getAll({ status: 'registered' })
      .then(r => setRestaurants(r.data.data || []))
      .catch(() => toast.error('Failed to load restaurants'))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  // Load sections when restaurant changes
  useEffect(() => {
    if (!form.restaurantId) return;
    tableAPI.getSections(form.restaurantId)
      .then(r => {
        const secs = r.data.data || [];
        setSections(secs);
        if (secs.length > 0) setForm(f => ({ ...f, section: secs[0] }));
      })
      .catch(() => {});
  }, [form.restaurantId]);

  // Load available tables when date/time/restaurant/section changes
  const fetchTables = useCallback(async () => {
    if (!form.restaurantId || !form.date || !form.timeSlot) {
      setTables([]);
      return;
    }
    setLoadingTables(true);
    try {
      const time24 = slotToTime24(form.timeSlot);
      const params = { restaurantId: form.restaurantId, date: form.date, timeSlot: time24 };
      if (form.section) params.section = form.section;
      const r = await tableAPI.getAvailable(params);
      setTables(r.data.data || []);
    } catch {
      toast.error('Failed to load available tables');
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, [form.restaurantId, form.date, form.timeSlot, form.section]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const time24 = slotToTime24(form.timeSlot);
      const endTime24 = addHour(time24);
      const res = await reservationAPI.create({
        restaurantId: form.restaurantId,
        tableId: form.tableId,
        date: form.date,
        timeSlot: time24,
        startTime: time24,
        endTime: endTime24,
        guestCount: form.guests,
        guestName: form.name,
        guestPhone: form.phone,
        notes: form.notes,
      });
      setCreatedReservation(res.data.data);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Styles ── */
  const containerStyle = {
    minHeight: '100vh',
    background: T.bg,
    paddingTop: 80,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const cardStyle = {
    background: T.card,
    borderRadius: 12,
    padding: 28,
    maxWidth: 560,
    margin: '0 auto',
  };

  const inputStyle = {
    width: '100%',
    background: T.input,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '12px 16px',
    color: T.white,
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const goldBtn = {
    width: '100%',
    background: T.gold,
    border: 'none',
    borderRadius: 50,
    padding: '14px 0',
    color: '#000',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 20,
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  };

  const labelStyle = { color: T.muted, fontSize: 13, marginBottom: 6, display: 'block' };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* Page title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => step > 1 && step < 4 ? setStep(s => s - 1) : navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.white, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={22} color={T.white} />
          </button>
          <h1 style={{ color: T.white, fontSize: 20, fontWeight: 700, margin: 0 }}>
            {step === 4 ? 'Reservation Confirmed' : 'New Reservation'}
          </h1>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {/* Step indicator */}
          <div style={{ marginBottom: 24 }}>
            <StepIndicator step={step} />
          </div>

          {/* ── STEP 1: Date & Time ── */}
          {step === 1 && (
            <div>
              {/* Restaurant selector */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Restaurant</label>
                <select
                  value={form.restaurantId}
                  onChange={e => setForm(f => ({ ...f, restaurantId: e.target.value, tableId: '', section: '' }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select a restaurant...</option>
                  {loadingRestaurants
                    ? <option>Loading...</option>
                    : restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>
              </div>

              {/* Calendar + Time side by side */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                {/* Calendar */}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ color: T.white, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
                    Select Date &amp; Time
                  </div>
                  <CalendarPicker
                    selected={form.date}
                    onSelect={date => setForm(f => ({ ...f, date }))}
                  />
                </div>

                {/* Time slots */}
                <TimeSlotList
                  slots={timeSlots}
                  selected={form.timeSlot}
                  onSelect={slot => setForm(f => ({ ...f, timeSlot: slot }))}
                />
              </div>

              <button
                style={{ ...goldBtn, opacity: !form.restaurantId || !form.date || !form.timeSlot ? 0.5 : 1 }}
                disabled={!form.restaurantId || !form.date || !form.timeSlot}
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          )}

          {/* ── STEP 2: Select Table ── */}
          {step === 2 && (
            <div>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ color: T.white, fontWeight: 700, fontSize: 18, margin: 0 }}>Select Table</h2>
                {sections.length > 1 && (
                  <select
                    value={form.section}
                    onChange={e => setForm(f => ({ ...f, section: e.target.value, tableId: '' }))}
                    style={{
                      background: T.card, border: `1px solid ${T.border}`,
                      borderRadius: 50, padding: '6px 14px',
                      color: T.white, fontSize: 13, cursor: 'pointer', outline: 'none',
                    }}
                  >
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>

              {/* Available label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
                <span style={{ color: T.white, fontSize: 13 }}>Available Tables</span>
              </div>

              {/* Table grid */}
              {loadingTables ? (
                <div style={{ textAlign: 'center', padding: 32 }}><Spinner size="md" /></div>
              ) : tables.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: T.muted }}>
                  No available tables for this date/time.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                  {tables.map(table => {
                    const isSelected = form.tableId === table._id;
                    return (
                      <button
                        key={table._id}
                        onClick={() => setForm(f => ({ ...f, tableId: table._id }))}
                        style={{
                          background: isSelected ? T.gold : T.input,
                          border: `1px solid ${isSelected ? T.gold : T.border}`,
                          borderRadius: 12, padding: '12px 14px',
                          display: 'flex', alignItems: 'center', gap: 10,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
                        <span style={{
                          color: isSelected ? '#000' : T.white,
                          fontWeight: 700, fontSize: 13,
                          letterSpacing: 1,
                        }}>
                          #TABLE {table.tableNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                style={{ ...goldBtn, opacity: !form.tableId ? 0.5 : 1 }}
                disabled={!form.tableId}
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </div>
          )}

          {/* ── STEP 3: Reservation Details ── */}
          {step === 3 && (
            <div>
              <h2 style={{ color: T.white, fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Reservation Details</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Joe Daniels"
                    onFocus={e => e.target.style.borderColor = T.gold}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+250 789 345 727"
                    onFocus={e => e.target.style.borderColor = T.gold}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Guests</label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    background: T.input, borderRadius: 8, padding: '10px 20px',
                    border: `1px solid ${T.border}`, width: 'fit-content',
                  }}>
                    <button
                      onClick={() => setForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, display: 'flex', alignItems: 'center' }}
                    >
                      <Minus size={18} color={T.gold} />
                    </button>
                    <span style={{ color: T.white, fontWeight: 700, fontSize: 18, minWidth: 20, textAlign: 'center' }}>
                      {form.guests}
                    </span>
                    <button
                      onClick={() => setForm(f => ({ ...f, guests: Math.min(50, f.guests + 1) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={18} color={T.gold} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Special Request</label>
                  <textarea
                    style={{ ...inputStyle, height: 100, resize: 'none' }}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Near the window please..."
                    onFocus={e => e.target.style.borderColor = T.gold}
                    onBlur={e => e.target.style.borderColor = T.border}
                  />
                </div>
              </div>

              <button
                style={{ ...goldBtn, opacity: submitting ? 0.6 : 1 }}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Confirming...' : 'Next'}
              </button>
            </div>
          )}

          {/* ── STEP 4: Confirmed ── */}
          {step === 4 && createdReservation && (
            <ConfirmedStep
              reservation={createdReservation}
              displaySlot={form.timeSlot}
              onDone={() => navigate('/reservations/my')}
              goldBtn={goldBtn}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Step 4 Confirmed ───────────────────────────────────── */
function ConfirmedStep({ reservation, displaySlot, onDone, goldBtn }) {
  const startTime = formatDisplayTime(reservation.startTime) || displaySlot;
  const endTime = formatDisplayTime(reservation.endTime) || '';

  const summaryRows = [
    {
      icon: <Calendar size={18} color={T.gold} />,
      label: 'Date',
      value: format(new Date(reservation.date), 'd MMM yyyy'),
    },
    {
      icon: <Clock size={18} color={T.gold} />,
      label: 'Time',
      value: endTime ? `${startTime} – ${endTime}` : startTime,
    },
    {
      icon: <Armchair size={18} color={T.gold} />,
      label: 'Table',
      value: `#TABLE ${reservation.tableId?.tableNumber || ''} (${reservation.tableId?.capacity || ''} seats)`,
    },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Check icon */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        border: `3px solid ${T.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Check size={36} color={T.gold} strokeWidth={2.5} />
      </div>

      <h2 style={{ color: T.white, fontWeight: 700, fontSize: 20, margin: '0 0 6px' }}>
        Your Reservation is confirmed!
      </h2>
      <p style={{ color: T.muted, fontSize: 13, margin: '0 0 4px' }}>Booking ID</p>
      <p style={{ color: T.white, fontWeight: 700, fontSize: 22, margin: '0 0 20px' }}>
        #{reservation.bookingId}
      </p>

      {/* Summary card */}
      <div style={{
        background: '#111', borderRadius: 12,
        border: `1px solid ${T.border}`,
        textAlign: 'left', overflow: 'hidden',
      }}>
        {summaryRows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px',
            borderBottom: i < summaryRows.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            {row.icon}
            <span style={{ color: T.white, fontSize: 14, flex: 1 }}>{row.label}</span>
            <span style={{ color: T.muted, fontSize: 14 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button style={{ ...goldBtn }} onClick={onDone}>Done</button>
    </div>
  );
}

export default Reservations;
