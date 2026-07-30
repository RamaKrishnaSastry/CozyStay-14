import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import { Property } from '../types';

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', pricePerNight: '', location: '', photos: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    propertyApi.getById(id).then((p: Property) => {
      setForm({
        title: p.title,
        description: p.description,
        pricePerNight: String(p.pricePerNight),
        location: p.location,
        photos: p.photos.join('\n'),
      });
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await propertyApi.update(id!, {
        title: form.title,
        description: form.description,
        pricePerNight: Number(form.pricePerNight),
        location: form.location,
        photos: form.photos.split('\n').map(s => s.trim()).filter(Boolean),
      });
      navigate(`/listings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
  };

  if (loading) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Edit Listing
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Description" fullWidth multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Price per night ($)" type="number" fullWidth value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required slotProps={{ htmlInput: { min: 0 } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Location" fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Photo URLs (one per line)" fullWidth multiline rows={3} value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} required />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" size="large" startIcon={<SaveOutlined />} sx={{ mt: 3 }}>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
