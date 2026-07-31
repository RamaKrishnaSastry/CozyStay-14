import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box, Chip,
} from '@mui/material';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import PhotoUploader from '../components/PhotoUploader';

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
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (photos.length === 0) {
      setError('Add at least one photo.');
      return;
    }
    try {
      const property = await propertyApi.create({
        title,
        description,
        pricePerNight: Number(pricePerNight),
        location,
        photos,
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
          <TextField label="Price per night ($)" type="number" fullWidth value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required slotProps={{ htmlInput: { min: 0 } }} sx={{ mb: 2 }} />
          <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} required sx={{ mb: 2 }} />
          <PhotoUploader value={photos} onChange={setPhotos} label="Upload photos (mock upload, no platform)" />

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
