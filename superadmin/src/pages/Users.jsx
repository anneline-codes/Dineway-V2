import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination';

const ROLE_LABELS = { customer: 'Customer', restaurant_admin: 'Restaurant Admin', super_admin: 'Super Admin', admin: 'Admin' };

export default function Users() {
  const [data, setData] = useState({ users: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', page: 1 });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/users?${params}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const updateUser = async (id, updates) => {
    try { await api.patch(`/users/${id}`, updates); load(); }
    catch { toast.error('Update failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const avatarColor = (name) => {
    const colors = ['#C9A84C', '#805ad5', '#3182ce', '#38a169', '#dd6b20'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Users</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Manage all platform users.</div>
        </div>
        <button style={btnOutline}><Download size={13} style={{ marginRight: 4 }} />Export</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 160 }} value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="restaurant_admin">Restaurant Admin</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select style={{ ...inputStyle, width: 140 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input placeholder="Search users..." onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 32, ...inputStyle, width: 220 }} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#a0aec0', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>Loading...</td></tr>
                : data.users?.length === 0 ? <tr><td colSpan={6} style={{ padding: 36, textAlign: 'center', color: '#a0aec0' }}>No users found</td></tr>
                  : data.users?.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColor(u.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <select style={{ ...inputStyle, width: 160, padding: '4px 8px', fontSize: 12 }}
                          value={u.role} onChange={e => updateUser(u._id, { role: e.target.value })}>
                          <option value="customer">Customer</option>
                          <option value="restaurant_admin">Restaurant Admin</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <select style={{ ...inputStyle, width: 110, padding: '4px 8px', fontSize: 12 }}
                          value={u.status || 'active'} onChange={e => updateUser(u._id, { status: e.target.value })}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#718096', fontSize: 12 }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e53e3e', padding: 4 }} onClick={() => remove(u._id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#718096' }}>Total: {data.total || 0} users</span>
          <Pagination page={filters.page} pages={Math.ceil((data.total || 0) / 20) || 1} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const btnOutline = { display: 'inline-flex', alignItems: 'center', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
