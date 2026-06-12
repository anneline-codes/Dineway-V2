import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import useAuthStore from './store/authStore';

const Login       = lazy(() => import('./pages/Login'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const Hotels      = lazy(() => import('./pages/Hotels'));
const Users       = lazy(() => import('./pages/Users'));
const Orders      = lazy(() => import('./pages/Orders'));
const Bookings    = lazy(() => import('./pages/Bookings'));
const Reviews     = lazy(() => import('./pages/Reviews'));
const Finance     = lazy(() => import('./pages/Finance'));
const Reports     = lazy(() => import('./pages/Reports'));
const Settings    = lazy(() => import('./pages/Settings'));
const Support     = lazy(() => import('./pages/Support'));

function Guard({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'super_admin') return <Navigate to="/login" replace />;
  return children;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="hotels"      element={<Hotels />} />
            <Route path="users"       element={<Users />} />
            <Route path="orders"      element={<Orders />} />
            <Route path="bookings"    element={<Bookings />} />
            <Route path="reviews"     element={<Reviews />} />
            <Route path="finance"     element={<Finance />} />
            <Route path="reports"     element={<Reports />} />
            <Route path="settings"    element={<Settings />} />
            <Route path="support"     element={<Support />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
