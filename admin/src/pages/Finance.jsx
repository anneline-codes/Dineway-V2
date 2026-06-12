import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/finance/admin')
      .then(({ data }) => {
        setTransactions(data.data.transactions || []);
        setTotal(data.data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 p-4">Loading finances...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#E5E0D5]">Finance</h1>
        <div className="bg-[#1A1A1A] rounded-xl px-5 py-3 border border-[#222]">
          <span className="text-gray-400 text-sm">Total Revenue</span>
          <p className="text-gold text-xl font-bold">${total.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#222] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#222] text-gray-400">
            <tr>{['Type', 'Description', 'Amount', 'Status', 'Date'].map(h => (
              <th key={h} className="text-left px-5 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b border-[#222] last:border-0 hover:bg-white/5">
                <td className="px-5 py-3 text-[#E5E0D5] capitalize">{t.type}</td>
                <td className="px-5 py-3 text-gray-400">{t.description || '—'}</td>
                <td className="px-5 py-3 text-gold">${t.amount?.toLocaleString() || 0}</td>
                <td className="px-5 py-3 text-gray-400 capitalize">{t.status}</td>
                <td className="px-5 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
