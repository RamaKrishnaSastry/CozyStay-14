import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { propertyApi, bookingApi } from '../api';
import { Property, Booking } from '../types';
import { Link } from 'react-router-dom';

export default function HostDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      propertyApi.getAll(),
      bookingApi.getRequests(),
    ]).then(([props, reqs]) => {
      setListings(props.filter((p) => (p.host as any)._id === user!.id || p.host === user!.id));
      setRequests(reqs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id: string, action: 'confirmed' | 'declined') => {
    await bookingApi.respond(id, action);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone if there are active bookings.')) return;
    try {
      await propertyApi.delete(id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Host Dashboard</h1>

      <h2>My Listings</h2>
      {listings.length === 0 ? <div className="empty">You have no listings yet.</div> : (
        <div className="listing-list">
          {listings.map((p) => (
            <div key={p._id} className="listing-row">
              <Link to={`/listings/${p._id}`}>{p.title}</Link>
              <span>${p.pricePerNight}/night</span>
              <Link to={`/listings/${p._id}/edit`} className="btn-sm">Edit</Link>
              <button onClick={() => handleDelete(p._id)} className="btn-sm btn-danger">Delete</button>
            </div>
          ))}
        </div>
      )}

      <h2>Booking Requests</h2>
      {requests.length === 0 ? <div className="empty">No booking requests yet.</div> : (
        <div className="request-list">
          {requests.map((r) => (
            <div key={r._id} className={`request-card status-${r.status}`}>
              <p><strong>{r.guest?.name}</strong> requested <strong>{(r.property as any)?.title}</strong></p>
              <p>{new Date(r.startDate).toLocaleDateString()} — {new Date(r.endDate).toLocaleDateString()}</p>
              <p>Status: {r.status}</p>
              {r.status === 'pending' && (
                <div className="request-actions">
                  <button onClick={() => handleRespond(r._id, 'confirmed')} className="btn-sm btn-success">Accept</button>
                  <button onClick={() => handleRespond(r._id, 'declined')} className="btn-sm btn-danger">Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
