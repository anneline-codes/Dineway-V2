import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard, UtensilsCrossed, Hotel, Users, ShoppingBag,
  CalendarCheck, Star, DollarSign, BarChart2, Settings, Headphones,
  LogOut, Bell, Search, ChevronDown, Menu,
} from 'lucide-react';
import DinewayLogo from './DinewayLogo';

const nav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Overview' },
  { to: '/restaurants', icon: UtensilsCrossed,  label: 'Restaurants' },
  { to: '/hotels',      icon: Hotel,            label: 'Hotels' },
  { to: '/users',       icon: Users,            label: 'Users' },
  { to: '/orders',      icon: ShoppingBag,      label: 'Orders' },
  { to: '/bookings',    icon: CalendarCheck,    label: 'Bookings' },
  { to: '/reviews',     icon: Star,             label: 'Reviews' },
  { to: '/finance',     icon: DollarSign,       label: 'Finance' },
  { to: '/reports',     icon: BarChart2,        label: 'Reports' },
  { to: '/settings',    icon: Settings,         label: 'Settings' },
  { to: '/support',     icon: Headphones,       label: 'Support' },
];

const titles = {
  '/dashboard':   ['Overview',        'Monitor all restaurants, hotels, users and system performance.'],
  '/restaurants': ['Restaurants',     'Manage all restaurants in the system.'],
  '/hotels':      ['Hotels',          'Manage all hotels in the system.'],
  '/users':       ['Users',           'Manage all users in the system.'],
  '/orders':      ['Orders',          'Track and manage all orders.'],
  '/bookings':    ['Bookings',        'Track all reservations platform-wide.'],
  '/reviews':     ['Reviews',         'Moderate and approve venue reviews.'],
  '/finance':     ['Finance',         'Track all financial transactions.'],
  '/reports':     ['Reports',         'View detailed system analytics.'],
  '/settings':    ['Settings',        'Manage system settings.'],
  '/support':     ['Support Tickets', 'Manage customer support tickets.'],
};

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [title, subtitle] = titles[location.pathname] || ['Dashboard', ''];
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 210 : 0, minWidth: sidebarOpen ? 210 : 0,
        background: '#1a1a2e', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'width 0.22s, min-width 0.22s',
        flexShrink: 0, zIndex: 100,
      }}>
        <div style={{ padding: '20px 14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <DinewayLogo size={52} />
          <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#C9A84C', letterSpacing: 3 }}>DINEWAY</div>
            <div style={{ fontSize: 8.5, color: 'rgba(201,168,76,0.6)', letterSpacing: 2, marginTop: 2 }}>GLOBAL ADMIN</div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 7, marginBottom: 2,
              color: isActive ? '#C9A84C' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#C9A84C' : 'transparent'}`,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s', whiteSpace: 'nowrap', textDecoration: 'none',
            })}>
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 7, width: '100%',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer',
          }}>
            <LogOut size={15} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 58, background: '#ffffff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(v => !v)} style={{ background: 'transparent', border: 'none', color: '#718096', padding: 4, cursor: 'pointer', display: 'flex' }}>
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{subtitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' }}>
              <Search size={14} color="#a0aec0" />
              <input placeholder="Search..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1a1a2e', fontSize: 13, width: 160 }} />
            </div>
            <button style={{ position: 'relative', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 8px', color: '#718096', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bell size={16} strokeWidth={1.8} />
              <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, background: '#C9A84C', borderRadius: '50%', border: '2px solid #fff' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f7fafc' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{user?.name || 'Super Admin'}</div>
                <div style={{ fontSize: 10, color: '#718096' }}>Super Admin</div>
              </div>
              <ChevronDown size={13} color="#a0aec0" />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
