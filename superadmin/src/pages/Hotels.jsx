import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const EMPTY = { name: '', email: '', location: { city: '', country: '' }, cuisine: '', phone: '', status: 'pending', adminName: '', adminEmail: '', adminPassword: '' };

export default function Hotels() {
  const [data, setData] = useState({ venues: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('type', 'hotel');
    api.get(`/restaurants/admin/all?${params}`)
      .then(r => setData({ venues: r.data.data.venues, total: r.data.data.total, pages: Math.ceil(r.data.data.total / 20) || 1, page: filters.page }))
      .catch(() => toast.error('Failed to load hotels'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (v) => {
    setForm({ name: v.name, email: v.email || '', location: { city: v.location?.city || '', country: v.location?.country || '' }, cuisine: v.cuisine || '', phone: v.phone || '', status: v.status });
    setModal(v);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/restaurants/admin', { ...form, type: 'hotel' });
        toast.success('Hotel created');
      } else {
        await api.put(`/restaurants/admin/${modal._id}`, form);
        toast.success('Hotel updated');
      }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this hotel?')) return;
    try { await api.delete(`/restaurants/admin/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleStatus = async (v) => {
    const next = v.status === 'active' ? 'inactive' : 'active';
    try { await api.patch(`/restaurants/admin/${v._id}/status`, { status: next }); load(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={row}>
        <div>
          <div style={titleStyle}>Hotels</div>
          <div style={sub}>Manage all hotels on the platform.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
          <button style={btnPrimary} onClick={() => { setForm(EMPTY); setModal('add'); }}><Plus size={13} style={{ marginRight: 4 }} />Add Hotel</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['', 'registered', 'pending', 'inactive'].map(s => (
          <button key={s} onClick={() => setFilters(f => ({ ...f, status: s, page: 1 }))}
            style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${filters.status === s ? '#C9A84C' : '#e2e8f0'}`, background: filters.status === s ? '#C9A84C' : '#fff', color: filters.status === s ? '#fff' : '#4a5568', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input placeholder="Search..." onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} style={{ paddingLeft: 32, ...inputStyle, width: 200 }} />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              {['Hotel', 'Location', 'Status', 'Rating', 'Bookings', 'Revenue', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={emptyCell}>Loading...</td></tr>
                : data.venues.length === 0 ? <tr><td colSpan={7} style={emptyCell}>No hotels found</td></tr>
                  : data.venues.map(v => (
                    <tr key={v._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>🏨</span>{v.name}</div>
                      </td>
                      <td style={cellMuted}>{v.location?.city}{v.location?.country ? `, ${v.location.country}` : ''}</td>
                      <td style={{ padding: '10px 12px' }}><span style={badge(v.status)}>{v.status}</span></td>
                      <td style={cellMuted}>{'★'.repeat(Math.round(v.rating || 0))} {v.rating?.toFixed(1) || '0.0'}</td>
                      <td style={cellMuted}>{v.orderCount || 0}</td>
                      <td style={{ padding: '10px 12px', color: '#C9A84C', fontWeight: 600, fontSize: 13 }}>${(v.revenue || 0).toLocaleString()}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={iconBtn} onClick={() => toggleStatus(v)} title="Toggle status"><Eye size={13} /></button>
                          <button style={iconBtn} onClick={() => openEdit(v)} title="Edit"><Edit2 size={13} /></button>
                          <button style={{ ...iconBtn, color: '#e53e3e' }} onClick={() => remove(v._id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.venues.length} of {data.total}</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>

      {modal && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{modal === 'add' ? 'Add Hotel' : 'Edit Hotel'}</div>
              <button style={iconBtn} onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label style={labelStyle}>City</label><input style={inputStyle} value={form.location.city} onChange={e => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))} /></div>
              <div><label style={labelStyle}>Country</label><input style={inputStyle} value={form.location.country} onChange={e => setForm(f => ({ ...f, location: { ...f.location, country: e.target.value } }))} /></div>
              <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
              {modal === 'add' && <>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: 14, marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 10 }}>HOTEL ADMIN ACCOUNT (optional)</div>
                </div>
                <div><label style={labelStyle}>Admin Name</label><input style={inputStyle} placeholder="Manager's name" value={form.adminName} onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} /></div>
                <div><label style={labelStyle}>Admin Email</label><input style={inputStyle} type="email" placeholder="manager@example.com" value={form.adminEmail} onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Admin Password</label><input style={inputStyle} type="password" placeholder="Min 6 characters" value={form.adminPassword} onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))} /></div>
              </>}
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" style={btnOutline} onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 };
const titleStyle = { fontSize: 20, fontWeight: 700, color: '#1a1a2e' };
const sub = { fontSize: 13, color: '#718096', marginTop: 2 };
const cardStyle = { background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' };
const emptyCell = { padding: 36, textAlign: 'center', color: '#a0aec0', fontSize: 13 };
const cellMuted = { padding: '10px 12px', color: '#718096', fontSize: 13 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#4a5568', marginBottom: 5 };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096', padding: 4, display: 'flex', alignItems: 'center' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modalBox = { background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' };
const badge = (s) => ({ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s === 'registered' ? '#E6F4EA' : s === 'active' ? '#E6F4EA' : s === 'inactive' ? '#FEE2E2' : '#FFF9E6', color: s === 'registered' ? '#38a169' : s === 'active' ? '#38a169' : s === 'inactive' ? '#e53e3e' : '#d69e2e' });
