import { useState, useEffect } from 'react';
import {
  Container, Grid, Box, Typography, TextField, Slider,
  CircularProgress, Alert, InputAdornment,
} from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (location) params.location = location;
    if (maxPrice < 1000) params.maxPrice = maxPrice;
    propertyApi.getAll(params)
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [location, maxPrice]);

  return (
    <Box>
      <Box
        sx={(theme) => ({
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #FF385C 0%, #FF6B6B 100%)',
          py: { xs: 6, md: 8 },
          mb: 4,
        })}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: '#fff', mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Find your cozy stay
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.85)', mb: 4 }}>
            Explore unique homes and experiences across India
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              p: 3,
              borderRadius: 3,
              maxWidth: 700,
            }}
          >
            <TextField
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><SearchOutlined /></InputAdornment>
                  ),
                },
              }}
              sx={{
                flex: 2,
                minWidth: 200,
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 1 },
              }}
            />
            <TextField
              placeholder="Max price"
              type="number"
              value={maxPrice === 1000 ? '' : maxPrice}
              onChange={(e) => {
                const val = e.target.value;
                setMaxPrice(val ? Number(val) : 1000);
              }}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
              sx={{
                flex: 1, minWidth: 140, bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 1 },
              }}
            />
          </Box>

          <Box sx={{ mt: 3, maxWidth: 400 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>
              Max price: ${maxPrice}
            </Typography>
            <Slider
              value={maxPrice}
              onChange={(_, v) => setMaxPrice(v as number)}
              min={50}
              max={1000}
              step={10}
              sx={{
                color: '#fff',
                '& .MuiSlider-thumb': { border: '2px solid #fff' },
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No listings found. Try different filters or check back later.
          </Alert>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {location ? `Homes in ${location}` : 'Featured homes'}
              <Typography variant="body2" color="text.secondary" component="span">
                {' '}· {properties.length} {properties.length === 1 ? 'stay' : 'stays'}
              </Typography>
            </Typography>
            <Grid container spacing={3}>
              {properties.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PropertyCard property={p} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
