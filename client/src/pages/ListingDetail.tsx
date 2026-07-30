import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { propertyApi, bookingApi } from '../api';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    propertyApi.getById(id)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    try {
      await bookingApi.create({ property_id: Number(id!), start_date: startDate, end_date: endDate });
      setBookingSuccess('Booking request sent!');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!property) return <div className="page"><h1>404 — Listing not found</h1></div>;

  return (
    <div className="page listing-detail">
      <div className="listing-gallery">
        {property.photos.map((photo, i) => (
          <img key={i} src={photo} alt={`${property.title} ${i + 1}`}
            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500" fill="%23eee"%3E%3Crect width="800" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E'; }}
          />
        ))}
      </div>
      <h1>{property.title}</h1>
      <p className="listing-location">{property.location}</p>
      <p className="listing-price">${property.price_per_night} / night</p>
      <p className="listing-host">Hosted by {property.host_name}</p>
      <p>{property.description}</p>

      {user && user.role === 'guest' && (
        <form onSubmit={handleBooking} className="booking-form">
          <h2>Request to Book</h2>
          {bookingError && <div className="error">{bookingError}</div>}
          {bookingSuccess && <div className="success">{bookingSuccess}</div>}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <button type="submit">Request to Book</button>
        </form>
      )}
    </div>
  );
}
