import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
      navigate(`/listings/${property._id}`);
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
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
}
