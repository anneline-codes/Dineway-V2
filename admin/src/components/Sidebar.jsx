import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, CalendarDays, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

const links = [
  { to: '/overview',      icon: LayoutDashboard, label: 'Overview' },
  { to: '/orders',        icon: ShoppingBag,     label: 'Orders' },
  { to: '/menu',          icon: UtensilsCrossed, label: 'Menus' },
  { to: '/reservations',  icon: CalendarDays,    label: 'Reservations' },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 230, minHeight: '100vh', background: '#111',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
        <img
          src="/logo.png"
          alt="Dineway"
          style={{ width: 140, objectFit: 'contain', mixBlendMode: 'lighten' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#C9A84C' : '#aaa',
              background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Food image */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '2px solid #C9A84C',
          height: 160,
          background: '#222',
        }}>
          <img
            src="/food.png"
            alt="featured dish"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '0 12px 24px' }}>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#aaa', fontSize: 14, fontFamily: 'inherit',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
