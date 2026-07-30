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
    if (location) params.location = location;
    if (maxPrice) params.maxPrice = maxPrice;
    propertyApi.getAll(params)
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [location, maxPrice]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const filtered = useMemo(() => {
    let list = properties;
    if (selectedAmenities.length > 0) {
      list = list.filter((p) => selectedAmenities.every((a) => p.amenities.includes(a)));
    }
    return list;
  }, [properties, selectedAmenities]);

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <NaturalLanguageSearch onFiltersChange={setNlFilters} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
            },
          }}
          sx={{ minWidth: 220 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Max $</Typography>
          <TextField
            size="small"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 0, max: 10000 } }}
            sx={{ width: 100 }}
          />
        </Box>
        <Chip
          icon={showFilters ? <CloseOutlined /> : <TuneOutlined />}
          label="Filters"
          variant="outlined"
          size="small"
          onClick={() => setShowFilters(!showFilters)}
          color={selectedAmenities.length > 0 ? 'primary' : 'default'}
        />
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
          {ALL_AMENITIES.map((a) => (
            <Chip key={a} label={a} size="small"
              onClick={() => toggleAmenity(a)}
              variant={selectedAmenities.includes(a) ? 'filled' : 'outlined'}
              color={selectedAmenities.includes(a) ? 'primary' : 'default'}
            />
          ))}
        </Box>
      </Collapse>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No listings found. Try different filters or check back later.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Suspense fallback={<CircularProgress />}>
                <PropertyCard property={p} />
              </Suspense>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
