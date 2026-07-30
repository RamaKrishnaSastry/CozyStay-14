import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box,
} from '@mui/material';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';

export default function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const property = await propertyApi.create({
        title,
        description,
        pricePerNight: Number(pricePerNight),
        location,
        photos: photos.split('\n').map(s => s.trim()).filter(Boolean),
      });
      navigate(`/listings/${property.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          List your place on CozyStay
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Share your space with travelers around the world
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth multiline rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Price per night ($)"
                type="number"
                fullWidth
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Location" fullWidth value={location} onChange={(e) => setLocation(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Photo URLs (one per line)"
                fullWidth multiline rows={3}
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
                placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<AddPhotoAlternateOutlined />}
            sx={{ mt: 3 }}
          >
            Create Listing
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
