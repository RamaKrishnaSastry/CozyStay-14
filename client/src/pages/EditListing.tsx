import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box, Chip, CircularProgress,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import { Property } from '../types';

const ALL_AMENITIES = [
  'WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Beach Access', 'Pet Friendly',
  'Gym', 'Fireplace', 'Bonfire', 'Jacuzzi', 'Breakfast', 'Garden', 'Hiking',
];

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', pricePerNight: '', location: '', photos: '' });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const photoUrls = form.photos.split('\n').map(s => s.trim()).filter(Boolean);

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
      setSelectedAmenities(p.amenities || []);
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
        photos: photoUrls,
        amenities: selectedAmenities,
      });
      navigate(`/listings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit Listing</Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          <TextField label="Title" fullWidth value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required sx={{ mb: 2 }} />
          <TextField label="Price per night ($)" type="number" fullWidth value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required inputProps={{ min: 0 }} sx={{ mb: 2 }} />
          <TextField label="Location" fullWidth value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required sx={{ mb: 2 }} />
          <TextField label="Photo URLs (one per line)" fullWidth multiline rows={3} value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} required sx={{ mb: 2 }} />

          {photoUrls.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {photoUrls.map((url, i) => (
                <Box key={i} component="img" src={url} sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }} />
              ))}
            </Box>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Amenities</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
            {ALL_AMENITIES.map((a) => (
              <Chip key={a} label={a} size="small"
                onClick={() => toggleAmenity(a)}
                variant={selectedAmenities.includes(a) ? 'filled' : 'outlined'}
                color={selectedAmenities.includes(a) ? 'primary' : 'default'}
              />
            ))}
          </Box>

          <Button type="submit" variant="contained" size="large" startIcon={<SaveOutlined />}>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
