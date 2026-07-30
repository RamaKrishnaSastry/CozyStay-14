import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Chip, CircularProgress, Button,
  Grid, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { CheckCircleOutlineOutlined, CancelOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { propertyApi, bookingApi } from '../api';
import { Property, Booking } from '../types';
import { useAuth } from '../context/AuthContext';

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'error',
};

export default function HostDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      propertyApi.getAll(),
      bookingApi.getRequests(),
    ]).then(([props, reqs]) => {
      setListings(props.filter((p) => p.hostId === user!.id));
      setRequests(reqs);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id: string, action: 'confirmed' | 'declined') => {
    await bookingApi.respond(id, action);
    load();
  };

  const handleDelete = async (id: string) => {
    try {
      await propertyApi.delete(id);
      setDeleteDialog(null);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Host Dashboard
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        <Tab label={`My Listings (${listings.length})`} />
        <Tab label={`Booking Requests (${requests.filter(r => r.status === 'pending').length})`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Your Properties</Typography>
            <Button variant="contained" component={Link} to="/listings/new" size="small">
              Add Listing
            </Button>
          </Box>
          {listings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">You haven't created any listings yet.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {listings.map((p) => (
                <Grid key={p.id} size={{ xs: 12 }}>
                  <Paper sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                    <Box
                      component="img"
                      src={p.photos[0] || ''}
                      sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        <Link to={`/listings/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {p.title}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${p.pricePerNight}/night · {p.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Button
                        component={Link}
                        to={`/listings/${p.id}/edit`}
                        size="small"
                        variant="outlined"
                        startIcon={<EditOutlined />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlined />}
                        onClick={() => setDeleteDialog(p.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {requests.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No booking requests yet.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {requests.map((r) => (
                <Grid key={r.id} size={{ xs: 12 }}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {r.guestName} requested {r.propertyTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(r.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — {new Date(r.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                        <Chip label={r.status} size="small" color={statusColors[r.status] || 'default'} sx={{ mt: 0.5 }} />
                      </Box>
                      {r.status === 'pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutlineOutlined />}
                            onClick={() => handleRespond(r.id, 'confirmed')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelOutlined />}
                            onClick={() => handleRespond(r.id, 'declined')}
                          >
                            Decline
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Delete Listing?</DialogTitle>
        <DialogContent>
          This will deactivate your listing. Active bookings may be affected.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button onClick={() => deleteDialog && handleDelete(deleteDialog)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
