import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { MessageOutlined } from '@mui/icons-material';
import { contactRequestApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  propertyId: string;
  hostId: string;
}

export default function ContactRequestButton({ propertyId, hostId }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user || user.role !== 'guest' || user.id === hostId) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await contactRequestApi.create({ propertyId, message: message || undefined });
      setSuccess('Contact request sent! The host will review it shortly.');
      setTimeout(() => setOpen(false), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<MessageOutlined />}
        onClick={() => user ? setOpen(true) : navigate('/login')}
        sx={{ mt: 1, textTransform: 'none' }}
      >
        Contact Host
      </Button>
      <Dialog open={open} onClose={() => { if (!loading) setOpen(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request to Contact Host</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>{success}</Alert>}
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder="Optional: Add a message to the host..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || !!success}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !!success}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
