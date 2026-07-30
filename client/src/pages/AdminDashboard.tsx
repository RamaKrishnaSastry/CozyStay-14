import { useState, useEffect } from 'react';
import { adminApi, userApi, propertyApi } from '../api';
import { User, Property, Booking } from '../types';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'stats' | 'users' | 'listings' | 'bookings'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (tab === 'stats') setStats(await adminApi.getStats());
        if (tab === 'users') setUsers(await userApi.getAll());
        if (tab === 'listings') setListings(await adminApi.getListings());
        if (tab === 'bookings') setBookings(await adminApi.getBookings());
      } catch {}
      setLoading(false);
    };
    load();
  }, [tab]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await userApi.delete(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    await userApi.update(editUser.id, { name: editUser.name, email: editUser.email, role: editUser.role as User['role'] });
    setEditUser(null);
    setUsers(await userApi.getAll());
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Deactivate this listing?')) return;
    await adminApi.deleteListing(id);
    setListings(listings.map(l => l._id === id ? { ...l, isActive: false } : l));
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    await adminApi.deleteBooking(id);
    setBookings(bookings.filter(b => b._id !== id));
  };

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        {(['stats', 'users', 'listings', 'bookings'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Users</h3><p>{stats.totalUsers}</p></div>
          <div className="stat-card"><h3>Active Listings</h3><p>{stats.totalActiveListings}</p></div>
          <div className="stat-card"><h3>Bookings</h3><p>{stats.totalBookings}</p></div>
        </div>
      )}

      {tab === 'users' && (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                {editUser?.id === u.id ? (
                  <>
                    <td><input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /></td>
                    <td><input value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} /></td>
                    <td>
                      <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                        <option value="guest">Guest</option><option value="host">Host</option><option value="admin">Admin</option>
                      </select>
                    </td>
                    <td><button onClick={handleUpdateUser} className="btn-sm">Save</button> <button onClick={() => setEditUser(null)} className="btn-sm">Cancel</button></td>
                  </>
                ) : (
                  <>
                    <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                    <td>
                      <button onClick={() => setEditUser({ id: u.id, name: u.name, email: u.email, role: u.role })} className="btn-sm">Edit</button>
                      <button onClick={() => handleDeleteUser(u.id)} className="btn-sm btn-danger">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'listings' && (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Host</th><th>Price</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {listings.map(l => (
              <tr key={l._id}>
                <td>{l.title}</td><td>{(l.host as any)?.name}</td><td>${l.pricePerNight}</td><td>{l.isActive ? 'Yes' : 'No'}</td>
                <td>{l.isActive && <button onClick={() => handleDeleteListing(l._id)} className="btn-sm btn-danger">Deactivate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'bookings' && (
        <table className="admin-table">
          <thead><tr><th>Property</th><th>Guest</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td>{(b.property as any)?.title}</td><td>{b.guest?.name}</td>
                <td>{new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}</td>
                <td>{b.status}</td>
                <td><button onClick={() => handleDeleteBooking(b._id)} className="btn-sm btn-danger">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
