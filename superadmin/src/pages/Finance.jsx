import { useState, useEffect, useCallback } from 'react';
import { Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

export default function Finance() {
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [summary, setSummary] = useState({ totalRevenue: 0, totalRefunds: 0, pendingPayout: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/finance?${params}`)
      .then(r => {
        setData({ transactions: r.data.data.transactions || [], total: r.data.data.total || 0 });
        if (r.data.data.summary) setSummary(r.data.data.summary);
      })
      .catch(() => toast.error('Failed to load finance data'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const typeBadge = (t) => ({
    payment: { bg: '#E6F4EA', color: '#38a169' },
    refund:  { bg: '#FEE2E2', color: '#e53e3e' },
    payout:  { bg: '#EBF8FF', color: '#3182ce' },
  }[t] || { bg: '#f0f0f0', color: '#718096' });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Finance</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Platform-wide financial transactions.</div>
        </div>
        <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: summary.totalRevenue, color: '#38a169' },
          { label: 'Total Refunds', value: summary.totalRefunds, color: '#e53e3e' },
          { label: 'Pending Payouts', value: summary.pendingPayout, color: '#d69e2e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>${(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 140 }} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 1 }))}>
          <option value="">All Types</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="payout">Payout</option>
        </select>
        <select style={{ ...inputStyle, width: 140 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
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
              {['Transaction ID', 'Type', 'Venue', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={emptyCell}>Loading...</td></tr>
                : data.transactions.length === 0 ? <tr><td colSpan={6} style={emptyCell}>No transactions found</td></tr>
                  : data.transactions.map(t => {
                    const tb = typeBadge(t.type);
                    return (
                      <tr key={t._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#C9A84C' }}>{t.transactionId || t._id?.slice(-10)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: tb.bg, color: tb.color, textTransform: 'capitalize' }}>{t.type}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{t.venue || '—'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#C9A84C', fontSize: 13 }}>${(t.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13, textTransform: 'capitalize' }}>{t.status}</td>
                        <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12 }}>
                          {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Total: {data.total}</span>
          <Pagination page={filters.page} pages={Math.ceil((data.total || 0) / 20) || 1} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const emptyCell = { padding: 36, textAlign: 'center', color: '#a0aec0', fontSize: 13 };
