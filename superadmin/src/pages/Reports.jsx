import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api/axios';

const tip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 } };

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#718096' }}>Loading reports...</div>;
  if (!data) return <div style={{ padding: 40, color: '#718096' }}>Failed to load reports.</div>;

  const { summary = {}, revenueChart = [], ordersByCategory = [] } = data;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Reports</div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          ['Total Orders',      summary.totalOrders,      '#dd6b20'],
          ['Total Restaurants', summary.totalRestaurants, '#C9A84C'],
          ['Total Hotels',      summary.totalHotels,      '#805ad5'],
          ['Total Users',       summary.totalUsers,       '#3182ce'],
          ['Total Revenue',     `$${(summary.totalRevenue || 0).toLocaleString()}`, '#38a169'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{val ?? '—'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Revenue Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" fill="url(#rg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Orders by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByCategory} layout="vertical">
              <XAxis type="number" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fill: '#718096', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...tip} />
              <Bar dataKey="count" fill="#C9A84C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', borderRadius: 10, padding: 18, border: '1px solid #e2e8f0' };
