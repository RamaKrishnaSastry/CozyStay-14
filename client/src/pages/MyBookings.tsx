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
            <Grid key={b.id} size={{ xs: 12 }}>
              <Paper sx={{ display: 'flex', overflow: 'hidden' }}>
                <Box
                  component={Link}
                  to={`/listings/${b.propertyId}`}
                  sx={{ width: { xs: 120, sm: 200 }, minHeight: 140, flexShrink: 0, display: 'block' }}
                >
                  <Box
                    component="img"
                    src={b.propertyPhoto || ''}
                    alt={b.propertyTitle}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
                <Box sx={{ p: 2, flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                    component={Link}
                    to={`/listings/${b.propertyId}`}
                  >
                    {b.propertyTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
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
