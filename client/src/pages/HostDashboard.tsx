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
      setListings(props.filter((p) => p.host_id === Number(user!.id)));
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

      <h2>My Listings</h2>
      {listings.length === 0 ? <div className="empty">You have no listings yet.</div> : (
        <div className="listing-list">
          {listings.map((p) => (
            <div key={p.id} className="listing-row">
              <Link to={`/listings/${p.id}`}>{p.title}</Link>
              <span>${p.price_per_night}/night</span>
              <Link to={`/listings/${p.id}/edit`} className="btn-sm">Edit</Link>
              <button onClick={() => handleDelete(String(p.id))} className="btn-sm btn-danger">Delete</button>
            </div>
          ))}
        </div>
      )}

      <h2>Booking Requests</h2>
      {requests.length === 0 ? <div className="empty">No booking requests yet.</div> : (
        <div className="request-list">
          {requests.map((r) => (
            <div key={r.id} className={`request-card status-${r.status}`}>
              <p><strong>{r.guest?.name}</strong> requested <strong>{(r.property as any)?.title}</strong></p>
              <p>{new Date(r.start_date).toLocaleDateString()} — {new Date(r.end_date).toLocaleDateString()}</p>
              <p>Status: {r.status}</p>
              {r.status === 'pending' && (
                <div className="request-actions">
                  <button onClick={() => handleRespond(String(r.id), 'confirmed')} className="btn-sm btn-success">Accept</button>
                  <button onClick={() => handleRespond(String(r.id), 'declined')} className="btn-sm btn-danger">Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
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
