import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">CozyStay</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Browse</Link>
        {user ? (
          <>
            {user.role === 'host' && <Link to="/host/dashboard">Dashboard</Link>}
            {user.role === 'host' && <Link to="/listings/new">Host a Place</Link>}
            {user.role === 'guest' && <Link to="/my-bookings">My Bookings</Link>}
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <button onClick={handleLogout} className="btn-link">Logout ({user.name})</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
