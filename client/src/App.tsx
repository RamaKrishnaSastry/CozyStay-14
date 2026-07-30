import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import MyBookings from './pages/MyBookings';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['host']} />}>
            <Route path="/host/dashboard" element={<HostDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
