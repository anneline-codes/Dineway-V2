import { useState, useEffect } from 'react';
import { UtensilsCrossed, Hotel, Users, ShoppingBag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { io } from 'socket.io-client';
import api from '../api/axios';

const COLORS = ['#C9A84C', '#4a90e0', '#dd6b20', '#38a169'];
const tip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 } };

function StatCard({ icon: Icon, label, value, change, iconBg, iconColor, prefix = '' }) {
  const up = Number(change) >= 0;
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{prefix}{typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}</div>
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: up ? '#38a169' : '#e53e3e', marginTop: 3 }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(Number(change))}% vs last week
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/dashboard/superadmin')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  // Real-time: refresh on new order
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true });
    socket.emit('join:superadmin');
    socket.on('order:new', () => load());
    return () => socket.disconnect();
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#718096' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: 40, color: '#718096' }}>Failed to load data.</div>;

  const { kpis, recentOrders = [], topVenues = [], revenueChart = [] } = data;

  const catData = [
    { name: 'Food', value: Math.round((kpis.totalOrders?.value || 0) * 0.41) },
    { name: 'Drinks', value: Math.round((kpis.totalOrders?.value || 0) * 0.28) },
    { name: 'Room Service', value: Math.round((kpis.totalOrders?.value || 0) * 0.19) },
    { name: 'Others', value: Math.round((kpis.totalOrders?.value || 0) * 0.12) },
  ];

  const statusBg = (s) => ({ pending: '#FFF9E6', confirmed: '#E6F4EA', cancelled: '#FEE2E2', delivered: '#E6F4EA', preparing: '#FFF3CD' }[s] || '#f0f0f0');
  const statusColor = (s) => ({ pending: '#d69e2e', confirmed: '#38a169', cancelled: '#e53e3e', delivered: '#38a169', preparing: '#dd6b20' }[s] || '#718096');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard icon={UtensilsCrossed} label="Total Restaurants" value={kpis.totalRestaurants?.value} change={kpis.totalRestaurants?.change} iconBg="rgba(201,168,76,0.12)" iconColor="#C9A84C" />
        <StatCard icon={Hotel}          label="Total Hotels"      value={kpis.totalHotels?.value}      change={kpis.totalHotels?.change}      iconBg="rgba(128,90,213,0.12)"  iconColor="#805ad5" />
        <StatCard icon={Users}          label="Total Users"       value={kpis.totalUsers?.value}        change={kpis.totalUsers?.change}        iconBg="rgba(49,130,206,0.12)"  iconColor="#3182ce" />
        <StatCard icon={ShoppingBag}    label="Total Orders"      value={kpis.totalOrders?.value}       change={kpis.totalOrders?.change}       iconBg="rgba(221,107,32,0.12)"  iconColor="#dd6b20" />
        <StatCard icon={DollarSign}     label="Total Revenue"     value={(kpis.totalRevenue?.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} change={kpis.totalRevenue?.change} iconBg="rgba(56,161,105,0.12)" iconColor="#38a169" prefix="$" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Revenue Overview</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" fill="url(#revG)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Top Venues</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topVenues.slice(0, 5).map((v, i) => (
              <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 18, flexShrink: 0 }}>{v.type === 'hotel' ? '🏨' : '🍽️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: '#718096', textTransform: 'capitalize' }}>{v.type}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <span style={{ color: '#C9A84C', fontSize: 12 }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{v.rating ? Number(v.rating).toFixed(1) : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>System Overview</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={[{ name: 'Restaurants', value: kpis.totalRestaurants?.value || 0 }, { name: 'Hotels', value: kpis.totalHotels?.value || 0 }]}
                cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                <Cell fill="#C9A84C" /><Cell fill="#805ad5" />
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          {[['Restaurants', kpis.totalRestaurants?.value || 0, '#C9A84C'], ['Hotels', kpis.totalHotels?.value || 0, '#805ad5']].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, color: '#718096' }}>{label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{val.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>Orders by Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          {catData.map((c, i) => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                <span style={{ fontSize: 11, color: '#718096' }}>{c.name}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{c.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Recent Orders</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Order', 'Customer', 'Restaurant', 'Amount', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#a0aec0', fontWeight: 600, padding: '0 8px 8px' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 6).map(o => (
                <tr key={o._id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 8, fontSize: 12, color: '#C9A84C', fontFamily: 'monospace' }}>{o.orderId || o._id?.slice(-6)}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{o.clientId?.name || '—'}</td>
                  <td style={{ padding: 8, fontSize: 12, color: '#718096' }}>{o.restaurantId?.name || '—'}</td>
                  <td style={{ padding: 8, fontSize: 12, fontWeight: 600, color: '#C9A84C' }}>${o.totalAmount || 0}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: statusBg(o.status), color: statusColor(o.status), textTransform: 'capitalize' }}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#a0aec0', fontSize: 13 }}>No recent orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', borderRadius: 10, padding: 18, border: '1px solid #e2e8f0' };
