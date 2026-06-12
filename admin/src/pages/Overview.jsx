import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Coffee, UtensilsCrossed } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const card = {
  background: '#fff', borderRadius: 12, padding: '20px 22px',
  border: '1px solid #e8e4dd', display: 'flex', alignItems: 'center', gap: 16,
};

function KPI({ icon: Icon, label, value, change }) {
  return (
    <div style={card}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'rgba(201,168,76,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color="#C9A84C" />
      </div>
      <div>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#1a1a1a', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</p>
        {change != null && (
          <p style={{ color: '#22c55e', fontSize: 11, marginTop: 4 }}>↑ {change}% vs last week</p>
        )}
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  completed: { bg: '#dcfce7', color: '#166534' },
  preparing:  { bg: '#fef9c3', color: '#854d0e' },
  pending:    { bg: '#fef3c7', color: '#92400e' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
  delivered:  { bg: '#dcfce7', color: '#166534' },
};

const chartData = [
  { x: 0,   drinks: 1, foods: 0.5 },
  { x: 10,  drinks: 2, foods: 1 },
  { x: 20,  drinks: 2.5, foods: 1.5 },
  { x: 30,  drinks: 3, foods: 2 },
  { x: 40,  drinks: 4, foods: 2.5 },
  { x: 50,  drinks: 3.5, foods: 3 },
  { x: 60,  drinks: 4.5, foods: 3.5 },
  { x: 70,  drinks: 5, foods: 4 },
  { x: 80,  drinks: 5.5, foods: 4.2 },
  { x: 90,  drinks: 6, foods: 4.5 },
  { x: 100, drinks: 6.2, foods: 4.8 },
];

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/dashboard/admin')
      .then(({ data: d }) => setData(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#888', padding: 24 }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
        Welcome back, {user?.name || 'Admin'} 👋
      </h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Here's a quick overview of your restaurant.</p>

      <hr style={{ border: 'none', borderTop: '1px solid #ddd', marginBottom: 24 }} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPI icon={ShoppingBag}     label="Total Orders"   value={(data?.todayOrders ?? 0).toLocaleString()}   change={18.6} />
        <KPI icon={DollarSign}      label="Total Revenue"  value={`$${(data?.todayRevenue ?? 0).toLocaleString()}`} change={22.4} />
        <KPI icon={Coffee}          label="Drinks Orders"  value={Math.round((data?.todayOrders ?? 0) * 0.51).toLocaleString()} change={16.2} />
        <KPI icon={UtensilsCrossed} label="Food Orders"    value={Math.round((data?.todayOrders ?? 0) * 0.49).toLocaleString()} change={21.7} />
      </div>

      {/* Charts + recent orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Chart */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e8e4dd' }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a', marginBottom: 20 }}>Orders Overview</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gDrinks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gFoods" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} label={{ value: 'Orders', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#aaa' }} />
              <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} label={{ value: 'Time', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#aaa' }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="drinks" name="Drinks" stroke="#C9A84C" fill="url(#gDrinks)" strokeWidth={2} />
              <Area type="monotone" dataKey="foods"  name="Foods"  stroke="#1a1a1a" fill="url(#gFoods)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e8e4dd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>Recent Orders</p>
            <a href="/orders" style={{ fontSize: 12, color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(data?.recentOrders || []).slice(0, 5).map(o => {
              const meta = STATUS_COLORS[o.status] || { bg: '#f3f4f6', color: '#555' };
              return (
                <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <UtensilsCrossed size={15} color="#888" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{o.orderId}</p>
                    <p style={{ fontSize: 11, color: '#999' }}>{o.clientId?.name || '—'} · ${o.totalAmount || 0}</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: meta.bg, color: meta.color, textTransform: 'capitalize',
                  }}>{o.status}</span>
                </div>
              );
            })}
            {!data?.recentOrders?.length && (
              <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
