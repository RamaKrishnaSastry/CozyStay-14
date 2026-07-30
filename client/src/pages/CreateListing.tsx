import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box, Chip,
} from '@mui/material';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';

const ALL_AMENITIES = [
  'WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Beach Access', 'Pet Friendly',
  'Gym', 'Fireplace', 'Bonfire', 'Jacuzzi', 'Breakfast', 'Garden', 'Hiking',
];

export default function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  const photoUrls = photos.split('\n').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const property = await propertyApi.create({
        title,
        description,
        pricePerNight: Number(pricePerNight),
        location,
        photos: photoUrls,
        amenities: selectedAmenities,
      });
      navigate(`/listings/${property.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Create a Listing</Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Price per night ($)" type="number" fullWidth value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required inputProps={{ min: 0 }} sx={{ mb: 2 }} />
          <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Photo URLs (one per line)" fullWidth multiline rows={3} value={photos} onChange={(e) => setPhotos(e.target.value)} required placeholder="https://example.com/photo1.jpg" sx={{ mb: 2 }} />

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

          <Button type="submit" variant="contained" size="large" startIcon={<AddPhotoAlternateOutlined />}>
            Create Listing
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
