import { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardMedia, CardContent, Box, Typography, Chip,
} from '@mui/material';
import { Property } from '../types';
import MediaItem from './MediaItem';

interface Props {
  property: Property;
}

function PropertyCard({ property }: Props) {
  return (
    <Card
      component={Link}
      to={`/listings/${property.id}`}
      sx={{
        textDecoration: 'none', color: 'inherit', cursor: 'pointer',
        '&:hover': { transform: 'translateY(-2px)' },
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
    >
      <MediaItem
        src={property.photos[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
        alt={property.title}
        sx={{ height: 200, width: '100%', objectFit: 'cover' }}
      />
      <CardContent sx={{ pb: '12px !important', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{
            fontWeight: 600, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {property.title}
          </Typography>
          {property.avgRating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>★</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{property.avgRating}</Typography>
            </Box>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{property.location}</Typography>
        <Typography variant="body2" sx={{ mt: 'auto' }}>
          <Box component="span" sx={{ fontWeight: 700 }}>${property.pricePerNight}</Box> night
        </Typography>
        {property.amenities && property.amenities.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {property.amenities.slice(0, 3).map((a) => (
              <Chip key={a} label={a} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
            {property.amenities.length > 3 && (
              <Chip label={`+${property.amenities.length - 3}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(PropertyCard);
