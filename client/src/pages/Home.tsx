import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Container, Grid, Box, Typography, TextField, Slider,
  CircularProgress, Alert, InputAdornment, Chip, Collapse,
} from '@mui/material';
import { SearchOutlined, TuneOutlined, CloseOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import { Property } from '../types';
import { NLSearchResult } from '../lib/groq';
import NaturalLanguageSearch from '../components/NaturalLanguageSearch';

const PropertyCard = lazy(() => import('../components/PropertyCard'));

const ALL_AMENITIES = [
  'WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Beach Access', 'Pet Friendly',
  'Gym', 'Fireplace', 'Bonfire', 'Jacuzzi', 'Breakfast', 'Garden', 'Hiking',
];

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [nlFilters, setNlFilters] = useState<NLSearchResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params: any = {};
    const effectiveLocation = nlFilters?.location || location;
    const effectiveMaxPrice = nlFilters?.maxPrice || (maxPrice < 1000 ? maxPrice : undefined);
    if (effectiveLocation) params.location = effectiveLocation;
    if (effectiveMaxPrice) params.maxPrice = effectiveMaxPrice;
    try {
      let results = await propertyApi.getAll(params);
      if (selectedAmenities.length > 0) {
        results = results.filter((p) =>
          selectedAmenities.every((a) => p.amenities.includes(a))
        );
      }
      if (nlFilters?.minPrice) {
        results = results.filter((p) => p.pricePerNight >= nlFilters.minPrice!);
      }
      if (nlFilters?.amenities?.length) {
        results = results.filter((p) =>
          nlFilters.amenities!.every((a) =>
            p.amenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
          )
        );
      }
      setProperties(results);
    } finally {
      setLoading(false);
    }
  }, [location, maxPrice, selectedAmenities, nlFilters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleAmenityToggle = useCallback((amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }, []);

  const propertyCount = useMemo(() => properties.length, [properties]);

  return (
    <Box>
      <Box
        sx={(theme) => ({
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #FF385C 0%, #FF6B6B 100%)',
          py: { xs: 4, md: 6 },
          mb: 3,
        })}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: '#fff', mb: 0.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Find your cozy stay
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.85)', mb: 3 }}>
            Explore unique homes across India
          </Typography>

          <Box sx={{ mb: 2 }}>
            <NaturalLanguageSearch onFiltersChange={setNlFilters} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              bgcolor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              p: 2,
              borderRadius: 2,
            }}
          >
            <TextField
              placeholder="Where are you going?"
              value={nlFilters?.location || location}
              onChange={(e) => setLocation(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment>,
                },
              }}
              sx={{
                flex: { xs: 1, sm: 2 }, minWidth: 180,
                bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              }}
            />
            <TextField
              placeholder="Max price"
              type="number"
              value={nlFilters?.maxPrice && nlFilters.maxPrice < 1000 ? nlFilters.maxPrice : maxPrice === 1000 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : 1000)}
              variant="outlined"
              size="small"
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              }}
              sx={{
                flex: 1, minWidth: 120, bgcolor: 'background.paper',
                '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              }}
            />
            <Chip
              icon={<TuneOutlined />}
              label="Filters"
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'filled' : 'outlined'}
              color={selectedAmenities.length > 0 ? 'primary' : 'default'}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
            />
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(8px)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1, fontWeight: 600 }}>
                Amenities
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {ALL_AMENITIES.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    size="small"
                    onClick={() => handleAmenityToggle(a)}
                    variant={selectedAmenities.includes(a) ? 'filled' : 'outlined'}
                    sx={{
                      color: selectedAmenities.includes(a) ? '#fff' : 'rgba(255,255,255,0.8)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: selectedAmenities.includes(a) ? 'primary.main' : 'transparent',
                      '&:hover': { bgcolor: selectedAmenities.includes(a) ? 'primary.dark' : 'rgba(255,255,255,0.1)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Collapse>

          <Box sx={{ mt: 2, maxWidth: 400 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }} gutterBottom>
              Max price: ${nlFilters?.maxPrice || maxPrice}
            </Typography>
            <Slider
              value={nlFilters?.maxPrice || maxPrice}
              onChange={(_, v) => setMaxPrice(v as number)}
              min={50}
              max={1000}
              step={10}
              sx={{ color: '#fff', '& .MuiSlider-thumb': { border: '2px solid #fff' } }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : propertyCount === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No listings match your criteria. Try adjusting your filters.
          </Alert>
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {nlFilters?.location || location ? `Homes in ${nlFilters?.location || location}` : 'Featured homes'}
              <Typography variant="body2" color="text.secondary" component="span">
                {' '}· {propertyCount} {propertyCount === 1 ? 'stay' : 'stays'}
              </Typography>
            </Typography>
            <Grid container spacing={2.5}>
              {properties.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Suspense fallback={<Box sx={{ height: 320, bgcolor: 'action.hover', borderRadius: 2 }} />}>
                    <PropertyCard property={p} />
                  </Suspense>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
