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
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
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
            <Grid key={b.id} size={{ xs: 12 }}>
              <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                {b.propertyPhoto && (
                  <Box component="img" src={b.propertyPhoto} sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Link to={`/listings/${b.propertyId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{b.propertyTitle}</Typography>
                  </Link>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={b.status} size="small" color={statusColors[b.status] || 'default'} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
