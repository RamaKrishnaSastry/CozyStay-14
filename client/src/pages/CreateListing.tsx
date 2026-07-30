import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box,
} from '@mui/material';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';

function PhotoPreview({ urls }: { urls: string[] }) {
  const [errored, setErrored] = useState<Set<number>>(new Set());
  if (urls.length === 0) return null;
  return (
    <div className="photo-preview-grid">
      {urls.map((url, i) => (
        <div key={i} className="photo-preview-item">
          {errored.has(i) ? (
            <div className="photo-preview-fallback">Invalid URL</div>
          ) : (
            <img src={url} alt={`Preview ${i + 1}`} onError={() => setErrored(s => new Set(s).add(i))} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState('');
  const [error, setError] = useState('');

  const photoUrls = photos.split('\n').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const property = await propertyApi.create({
        title,
        description,
        price_per_night: Number(pricePerNight),
        location,
        photos: photoUrls,
      });
      navigate(`/listings/${property.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="page">
      <h1>Create a Listing</h1>
      <form onSubmit={handleSubmit} className="listing-form">
        {error && <div className="error">{error}</div>}
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="number" placeholder="Price per night ($)" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required min={0} />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <textarea placeholder="Photo URLs (one per line)" value={photos} onChange={(e) => setPhotos(e.target.value)} required />
        <PhotoPreview urls={photoUrls} />
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
}
