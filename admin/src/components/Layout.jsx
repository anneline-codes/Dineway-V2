import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar' ;
import { User } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Layout() {
  const { user } = useAuthStore();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0ede8', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 28px', background: '#f0ede8' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <User size={18} color="#555" />
          </div>
        </div>
        <main style={{ flex: 1, padding: '0 28px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
