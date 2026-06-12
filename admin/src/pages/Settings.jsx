import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const FIELDS = [
  { key: 'name',               label: 'Restaurant Name' },
  { key: 'description',        label: 'Description' },
  { key: 'category',           label: 'Category' },
  { key: 'phone',              label: 'Phone' },
  { key: 'email',              label: 'Email' },
  { key: 'address.street',     label: 'Street Address' },
  { key: 'address.city',       label: 'City' },
  { key: 'address.country',    label: 'Country' },
];

export default function Settings() {
  const [form, setForm] = useState({
    name: '', description: '', category: '', phone: '', email: '',
    'address.street': '', 'address.city': '', 'address.country': '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants/me')
      .then(({ data }) => {
        const v = data.data.venue;
        setForm({
          name: v.name || '',
          description: v.description || '',
          category: v.category || '',
          phone: v.phone || '',
          email: v.email || '',
          'address.street': v.address?.street || '',
          'address.city': v.address?.city || '',
          'address.country': v.address?.country || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/restaurants/me', {
        name: form.name, description: form.description, category: form.category,
        phone: form.phone, email: form.email,
        address: { street: form['address.street'], city: form['address.city'], country: form['address.country'] },
      });
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-400 p-4">Loading settings...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#E5E0D5] mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#222] space-y-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              type="text" value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-2.5 text-[#E5E0D5] outline-none focus:border-gold"
            />
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="bg-gold text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
