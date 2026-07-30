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
    if (maxPrice) params.max_price = Number(maxPrice);
    propertyApi.getAll(params)
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [location, maxPrice]);

  return (
    <div className="page">
      <h1>Find your cozy stay</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max price / night"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="loading">Loading listings...</div>
      ) : properties.length === 0 ? (
        <div className="empty">No listings found. Try different filters or check back later.</div>
      ) : (
        <div className="property-grid">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
