import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Chip, CircularProgress, Button,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Listings" />
        <Tab label="Booking Requests" />
      </Tabs>

      {tab === 0 && (
        <>
          {listings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">You have no listings yet.</Typography>
              <Button component={Link} to="/listings/new" variant="contained" sx={{ mt: 2 }}>
                Create Your First Listing
              </Button>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {listings.map((p) => (
                <Paper key={p.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                  <Box component="img" src={p.photos[0]} sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Link to={`/listings/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{p.title}</Typography>
                    </Link>
                    <Typography variant="caption" color="text.secondary">${p.pricePerNight}/night · {p.location}</Typography>
                  </Box>
                  <Button component={Link} to={`/listings/${p.id}/edit`} size="small" startIcon={<EditOutlined />} variant="outlined">
                    Edit
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => setDeleteDialog(p.id)} variant="outlined">
                    Delete
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </>
      )}

      {tab === 1 && (
        <>
          {requests.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography color="text.secondary">No booking requests yet.</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {requests.map((r) => (
                <Paper key={r.id} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.guestName} requested <Link to={`/listings/${r.propertyId}`} style={{ textDecoration: 'none' }}>{r.propertyTitle}</Link>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.startDate).toLocaleDateString()} — {new Date(r.endDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={r.status} size="small" color={statusColors[r.status] || 'default'} />
                    </Box>
                  </Box>
                  {r.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" color="success" startIcon={<CheckCircleOutlineOutlined />}
                        onClick={() => handleRespond(r.id, 'confirmed')}>Accept</Button>
                      <Button size="small" color="error" startIcon={<CancelOutlined />}
                        onClick={() => handleRespond(r.id, 'declined')}>Decline</Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
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
