import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import useAuthStore from './store/authStore';

const Login        = lazy(() => import('./pages/Login'));
const Overview     = lazy(() => import('./pages/Overview'));
const Menu         = lazy(() => import('./pages/Menu'));
const Orders       = lazy(() => import('./pages/Orders'));
const Bookings     = lazy(() => import('./pages/Bookings'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Reviews      = lazy(() => import('./pages/Reviews'));
const Finance      = lazy(() => import('./pages/Finance'));
const Settings     = lazy(() => import('./pages/Settings'));

function Guard({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['restaurant_admin', 'restaurant_manager', 'admin'].includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1A1A1A', color: '#E5E0D5', border: '1px solid #333' } }} />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview"      element={<Overview />} />
            <Route path="menu"          element={<Menu />} />
            <Route path="orders"        element={<Orders />} />
            <Route path="bookings"      element={<Bookings />} />
            <Route path="reservations"  element={<Reservations />} />
            <Route path="reviews"       element={<Reviews />} />
            <Route path="finance"       element={<Finance />} />
            <Route path="settings"      element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
