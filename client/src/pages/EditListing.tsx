import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyApi } from '../api';
import { Property } from '../types';

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', pricePerNight: '', location: '', photos: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    propertyApi.getById(id).then((p: Property) => {
      setForm({
        title: p.title,
        description: p.description,
        pricePerNight: String(p.pricePerNight),
        location: p.location,
        photos: p.photos.join('\n'),
      });
    }).catch(() => navigate('/'));
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await propertyApi.update(id!, {
        title: form.title,
        description: form.description,
        pricePerNight: Number(form.pricePerNight),
        location: form.location,
        photos: form.photos.split('\n').map(s => s.trim()).filter(Boolean),
      });
      navigate(`/listings/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
  };

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
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
