import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AppTour from './components/AppTour';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const EditListing = lazy(() => import('./pages/EditListing'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const HostDashboard = lazy(() => import('./pages/HostDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress />
  </Box>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export default function App() {
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    const toured = localStorage.getItem('cozystay-tour-completed');
    if (!toured) {
      const timer = setTimeout(() => setTourOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1, pt: { xs: 7, sm: 8 } }}>
          <Routes>
            <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
            <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
            <Route path="/listings/:id" element={<Suspense fallback={<PageLoader />}><ListingDetail /></Suspense>} />

            <Route element={<ProtectedRoute />}>
              <Route path="/listings/new" element={<Suspense fallback={<PageLoader />}><CreateListing /></Suspense>} />
              <Route path="/listings/:id/edit" element={<Suspense fallback={<PageLoader />}><EditListing /></Suspense>} />
              <Route path="/my-bookings" element={<Suspense fallback={<PageLoader />}><MyBookings /></Suspense>} />
              <Route path="/messages" element={<Suspense fallback={<PageLoader />}><Messages /></Suspense>} />
              <Route path="/messages/:id" element={<Suspense fallback={<PageLoader />}><Messages /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['host']} />}>
              <Route path="/host/dashboard" element={<Suspense fallback={<PageLoader />}><HostDashboard /></Suspense>} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
            </Route>

            <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
          </Routes>
        </Box>
        <Footer />
      </Box>
      <AppTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onComplete={() => localStorage.setItem('cozystay-tour-completed', 'true')}
      />
    </GoogleOAuthProvider>
  );
}
