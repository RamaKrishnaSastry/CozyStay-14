import { useState, useEffect } from 'react';
import { propertyApi } from '../api';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
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
