import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

export default function Settings() {
  const [form, setForm] = useState({ siteName: 'Dineway', currency: 'USD', timezone: 'UTC', maintenanceMode: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(r => { if (r.data.data) setForm(f => ({ ...f, ...r.data.data })); })
      .catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('Settings saved.');
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const field = (key, label, type = 'text') => (
    <div key={key}>
      <label style={labelStyle}>{label}</label>
      {type === 'checkbox'
        ? <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
            <span style={{ fontSize: 13, color: '#4a5568' }}>Enabled</span>
          </label>
        : <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
      }
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 580 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>Settings</div>
      <form onSubmit={save} style={{ background: '#fff', borderRadius: 10, padding: 24, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {field('siteName', 'Site Name')}
        {field('currency', 'Currency')}
        {field('timezone', 'Timezone')}
        {field('maintenanceMode', 'Maintenance Mode', 'checkbox')}
        <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Saving…' : 'Save Settings'}</button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#4a5568', marginBottom: 5 };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
