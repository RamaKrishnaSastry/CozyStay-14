import { useState, useEffect } from 'react';
import { bookingApi } from '../api';
import { Booking } from '../types';
import { Link } from 'react-router-dom';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getMy()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="empty">No bookings yet.</div>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b.id} className={`booking-card status-${b.status}`}>
              <Link to={`/listings/${b.property_id}`}><h3>{(b.property as any)?.title}</h3></Link>
              <p>{new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {b.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
