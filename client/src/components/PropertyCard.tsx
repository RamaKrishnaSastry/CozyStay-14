import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../types';

interface Props {
  property: Property;
}

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23ddd"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function PropertyCard({ property }: Props) {
  const [imgError, setImgError] = useState(false);
  return (
    <Link to={`/listings/${property.id}`} className="property-card">
      <img
        src={imgError || !property.photos[0] ? FALLBACK_IMG : property.photos[0]}
        alt={property.title}
        className="property-card-img"
        onError={() => setImgError(true)}
      />
      <div className="property-card-body">
        <h3>{property.title}</h3>
        <p className="property-card-location">{property.location}</p>
        <p className="property-card-price">${property.price_per_night} / night</p>
      </div>
    </Link>
  );
}
