import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, TextField, Button, Alert, Box,
} from '@mui/material';
import { SaveOutlined } from '@mui/icons-material';
import { propertyApi } from '../api';
import { Property } from '../types';

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

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', pricePerNight: '', location: '', photos: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const photoUrls = form.photos.split('\n').map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    if (!id) return;
    propertyApi.getById(id).then((p: Property) => {
      setForm({
        title: p.title,
        description: p.description,
        pricePerNight: String(p.price_per_night),
        location: p.location,
        photos: p.photos.join('\n'),
      });
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await propertyApi.update(id!, {
        title: form.title,
        description: form.description,
        price_per_night: Number(form.pricePerNight),
        location: form.location,
        photos: photoUrls,
      });
      navigate(`/listings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
  };

  if (loading) return null;

  return (
    <div className="page">
      <h1>Edit Listing</h1>
      <form onSubmit={handleSubmit} className="listing-form">
        {error && <div className="error">{error}</div>}
        <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="number" placeholder="Price per night ($)" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} required min={0} />
        <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <textarea placeholder="Photo URLs (one per line)" value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} required />
        <PhotoPreview urls={photoUrls} />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
