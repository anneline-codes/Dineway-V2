import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

const EMPTY = { name: '', category: 'Mains', price: '', description: '', available: true };
const CATEGORIES = ['All Items', 'Appetizers', 'Main Courses', 'Desserts', 'Drinks'];
const CAT_MAP = { 'All Items': null, 'Appetizers': 'Starters', 'Main Courses': 'Mains', 'Desserts': 'Desserts', 'Drinks': 'Drinks' };
const PAGE_SIZE = 5;

export default function Menu() {
  const [items, setItems]     = useState([]);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Items');
  const [page, setPage]       = useState(1);
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId;

  const load = () => {
    if (!restaurantId) { setLoading(false); return; }
    api.get(`/menu/restaurant/${restaurantId}`)
      .then(({ data }) => setItems(data.data?.items || data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [restaurantId]);

  const filtered = activeTab === 'All Items'
    ? items
    : items.filter(i => i.category === CAT_MAP[activeTab] || i.category === activeTab);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, description: item.description || '', available: item.available ?? true });
    setModal(item);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await api.post('/menu', { ...form, price: Number(form.price), restaurantId });
        toast.success('Item added.');
      } else {
        await api.put(`/menu/${modal._id}`, { ...form, price: Number(form.price) });
        toast.success('Item updated.');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/menu/${id}`);
    toast.success('Deleted.');
    load();
  };

  if (loading) return <div style={{ color: '#888', padding: 24 }}>Loading menu...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Menus</h1>
          <p style={{ color: '#888', fontSize: 13 }}>Manage your restaurant menu items</p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', border: '1.5px solid #C9A84C',
            borderRadius: 8, padding: '9px 18px',
            color: '#C9A84C', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plus size={15} /> + Add Menu item
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e8e4dd' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveTab(cat); setPage(1); }}
            style={{
              padding: '10px 16px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: activeTab === cat ? 700 : 400,
              color: activeTab === cat ? '#C9A84C' : '#888',
              borderBottom: activeTab === cat ? '2px solid #C9A84C' : '2px solid transparent',
              marginBottom: -2, fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4dd', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['Item', 'Category', 'Prices', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: h === 'Actions' ? 'right' : 'left',
                  padding: '14px 24px', color: '#888', fontWeight: 500, fontSize: 13,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                      background: '#f5f0e8', flexShrink: 0,
                    }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽️</div>
                      }
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>{item.name}</p>
                      {item.description && <p style={{ color: '#aaa', fontSize: 12 }}>{item.description}</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', color: '#555' }}>{item.category}</td>
                <td style={{ padding: '14px 24px', fontWeight: 600, color: '#1a1a1a' }}>${item.price}</td>
                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                    background: item.available !== false ? '#dcfce7' : '#fee2e2',
                    color: item.available !== false ? '#166534' : '#991b1b',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {item.available !== false ? 'Available' : 'Unavailable'}
                  </span>
                  <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 10, color: '#aaa' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6, color: '#aaa' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '32px 24px', textAlign: 'center', color: '#aaa' }}>No items found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderTop: '1px solid #eee',
        }}>
          <span style={{ fontSize: 13, color: '#888' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} items
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}
            ><ChevronLeft size={14} /></button>
            <span style={{
              width: 30, height: 30, borderRadius: 6, border: '1.5px solid #C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#C9A84C',
            }}>{page}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}
            ><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 400, border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>{modal === 'add' ? 'Add Menu Item' : 'Edit Item'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="#aaa" /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Name *" value={form.name} required
                onChange={e => setForm({ ...form, name: e.target.value })} style={iStyle} />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={iStyle}>
                {['Starters','Mains','Desserts','Drinks','Specials'].map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Price *" value={form.price} required min="0" step="0.01"
                onChange={e => setForm({ ...form, price: e.target.value })} style={iStyle} />
              <input placeholder="Description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} style={iStyle} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                Available
              </label>
              <button type="submit" style={{ background: '#C9A84C', border: 'none', borderRadius: 8, padding: '11px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                {modal === 'add' ? 'Add Item' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const iStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, outline: 'none',
  background: '#fafafa', color: '#1a1a1a',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
