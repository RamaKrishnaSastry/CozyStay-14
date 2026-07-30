import { Link } from 'react-router-dom';
import { Property } from '../types';

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  return (
    <Link to={`/listings/${property._id}`} className="property-card">
      <img
        src={property.photos[0] || '/placeholder.jpg'}
        alt={property.title}
        className="property-card-img"
      />
      <div className="property-card-body">
        <h3>{property.title}</h3>
        <p className="property-card-location">{property.location}</p>
        <p className="property-card-price">${property.pricePerNight} / night</p>
      </div>
    </Link>
  );
}
