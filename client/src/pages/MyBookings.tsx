import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Chip, CircularProgress, Grid, Button,
} from '@mui/material';
import { bookingApi } from '../api';
import { Booking } from '../types';

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'error',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getMy()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            You haven't made any bookings yet.
          </Typography>
          <Button variant="contained" component={Link} to="/">
            Browse Stays
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {bookings.map((b) => (
            <div key={b.id} className={`booking-card status-${b.status}`}>
              <Link to={`/listings/${b.property_id}`}><h3>{(b.property as any)?.title}</h3></Link>
              <p>{new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {b.status}</p>
            </div>
          ))}
        </Grid>
      )}
    </Container>
  );
}
