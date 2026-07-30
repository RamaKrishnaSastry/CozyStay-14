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
      await bookingApi.create({ propertyId: id!, startDate, endDate });
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
        {property.photos.map((photo, i) => <img key={i} src={photo} alt={`${property.title} ${i + 1}`} />)}
      </div>
      <h1>{property.title}</h1>
      <p className="listing-location">{property.location}</p>
      <p className="listing-price">${property.pricePerNight} / night</p>
      <p className="listing-host">Hosted by {property.host?.name}</p>
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
