import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Overview = lazy(() => import('./pages/Overview'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Reservations = lazy(() => import('./pages/Reservations'));
const MyReservations = lazy(() => import('./pages/MyReservations'));
const Menu = lazy(() => import('./pages/Menu'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<Spinner size="lg" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Protected Routes */}
                <Route
                  path="/reservations"
                  element={
                    <ProtectedRoute>
                      <Reservations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reservations/my"
                  element={
                    <ProtectedRoute>
                      <MyReservations />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;