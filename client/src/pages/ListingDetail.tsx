import { useState, useEffect, FormEvent, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Box, Typography, Chip, Button, TextField, Paper, Avatar,
  CircularProgress, Alert, Divider, Rating,
} from '@mui/material';
import {
  LocationOnOutlined, StarOutlined, WifiOutlined, AcUnitOutlined,
  KitchenOutlined, LocalParkingOutlined, PoolOutlined, FitnessCenterOutlined,
  PetsOutlined, ElevatorOutlined, FireplaceOutlined, DeckOutlined,
  EventBusyOutlined,
} from '@mui/icons-material';
import { propertyApi, bookingApi, reviewApi } from '../api';
import { Property, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import MediaItem from '../components/MediaItem';
import ContactRequestButton from '../components/ContactRequestButton';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <WifiOutlined fontSize="small" />, AC: <AcUnitOutlined fontSize="small" />,
  Kitchen: <KitchenOutlined fontSize="small" />, Parking: <LocalParkingOutlined fontSize="small" />,
  Pool: <PoolOutlined fontSize="small" />, Gym: <FitnessCenterOutlined fontSize="small" />,
  'Pet Friendly': <PetsOutlined fontSize="small" />, Elevator: <ElevatorOutlined fontSize="small" />,
  Fireplace: <FireplaceOutlined fontSize="small" />, 'Beach Access': <DeckOutlined fontSize="small" />,
  Rooftop: <DeckOutlined fontSize="small" />,
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertyApi.getById(id)
      .then(setProperty)
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) {
      reviewApi.getByProperty(id).then(setReviews).catch(() => {});
    }
  }, [id]);

  const totalNights = useMemo(() =>
    startDate && endDate
      ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
    [startDate, endDate]
  );

  const handleBooking = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    if (!user) { navigate('/login'); return; }
    if (totalNights === 0) { setBookingError('Please select valid check-in and check-out dates.'); return; }
    try {
      await bookingApi.create({ propertyId: id!, startDate, endDate });
      setBookingSuccess('Booking request sent!');
      setStartDate('');
      setEndDate('');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  }, [user, id, startDate, endDate, navigate, totalNights]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!property) return <Container sx={{ py: 4 }}><Alert severity="warning">Listing not found</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <MediaItem
              src={property.photos[selectedPhoto]}
              alt={property.title}
              sx={{ width: '100%', height: { xs: 300, md: 450 }, objectFit: 'cover' }}
            />
            {property.photos.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 0.5 }}>
                {property.photos.map((photo, i) => (
                  <MediaItem
                    key={i}
                    src={photo}
                    alt={`${property.title} ${i + 1}`}
                    onClick={() => setSelectedPhoto(i)}
                    sx={{
                      width: 80, height: 60, objectFit: 'cover', borderRadius: 1, cursor: 'pointer', flexShrink: 0,
                      border: selectedPhoto === i ? '2px solid' : '2px solid transparent',
                      borderColor: selectedPhoto === i ? 'primary.main' : 'transparent',
                      opacity: selectedPhoto === i ? 1 : 0.6,
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{property.title}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{property.location}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
              {property.hostName?.charAt(0) || 'H'}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>Hosted by {property.hostName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(property.createdAt).getFullYear()}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, color: 'text.secondary' }}>
            {property.description}
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>What this place offers</Typography>
          <Grid container spacing={1.5} sx={{ mb: 4 }}>
            {property.amenities?.map((a) => (
              <Grid key={a} size={{ xs: 6, sm: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {amenityIcons[a] || <StarOutlined fontSize="small" />}
                  <Typography variant="body2">{a}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          </Grid>

          {/* Reviews Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Reviews {property.reviewCount ? `(${property.reviewCount})` : ''}
            </Typography>
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviews.map((r) => (
                  <Paper key={r.id} elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>
                        {r.userName?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.userName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Rating value={r.rating} readOnly size="small" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{r.text}</Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {user?.role === 'guest' && (
              <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Leave a Review</Typography>
                {reviewError && <Alert severity="error" sx={{ mb: 1, borderRadius: 1 }}>{reviewError}</Alert>}
                <Box sx={{ mb: 1 }}>
                  <Rating
                    value={reviewForm.rating}
                    onChange={(_, v) => setReviewForm((p) => ({ ...p, rating: v || 5 }))}
                  />
                </Box>
                <TextField
                  fullWidth multiline rows={2} size="small" placeholder="Share your experience..."
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm((p) => ({ ...p, text: e.target.value }))}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained" size="small"
                  onClick={async () => {
                    setReviewError('');
                    try {
                      const newReview = await reviewApi.create({
                        bookingId: `b-${Date.now()}`,
                        propertyId: id!,
                        rating: reviewForm.rating,
                        text: reviewForm.text,
                      });
                      setReviews((prev) => [newReview, ...prev]);
                      setReviewForm({ rating: 5, text: '' });
                    } catch (err: any) {
                      setReviewError(err.response?.data?.message || 'Failed to submit review');
                    }
                  }}
                >
                  Submit Review
                </Button>
              </Paper>
            )}
          </Box>

        {/* Booking Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: 'sticky', top: { md: 88 }, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>${property.pricePerNight}</Typography>
              <Typography variant="body2" color="text.secondary">/ night</Typography>
            </Box>

            {user?.role === 'guest' && (
              <Box component="form" onSubmit={handleBooking}>
                {bookingError && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{bookingError}</Alert>}
                {bookingSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>{bookingSuccess}</Alert>}
                <TextField label="Check-in" type="date" fullWidth value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: new Date().toISOString().split('T')[0] } }}
                  sx={{ mb: 2 }} />
                <TextField label="Check-out" type="date" fullWidth value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} required
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate || new Date().toISOString().split('T')[0] } }}
                  sx={{ mb: 2 }} />
                {totalNights > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">${property.pricePerNight} × {totalNights} nights</Typography>
                      <Typography variant="body2">${(property.pricePerNight * totalNights).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                      <Typography sx={{ fontWeight: 700 }}>${(property.pricePerNight * totalNights).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                )}
                <Button type="submit" variant="contained" fullWidth size="large" sx={{ py: 1.5 }}>
                  Request to Book
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  You won't be charged yet
                </Typography>
              </Box>
            )}
            {!user && (
              <Button variant="contained" fullWidth size="large" onClick={() => navigate('/login')} sx={{ py: 1.5 }}>
                Log in to Book
              </Button>
            )}
            {user && user.role !== 'guest' && (
              <Alert severity="info" sx={{ borderRadius: 1 }}>
                Switch to a guest account to book stays.
              </Alert>
            )}

            <ContactRequestButton propertyId={property.id} hostId={property.hostId} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
