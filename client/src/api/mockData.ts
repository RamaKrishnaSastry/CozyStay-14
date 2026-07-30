import { User, Property, Booking } from '../types';

const now = new Date().toISOString();

export const mockUsers: User[] = [
  { id: '1', name: 'Alice Host', email: 'alice@example.com', role: 'host', profilePhoto: 'https://i.pravatar.cc/150?u=alice', createdAt: now },
  { id: '2', name: 'Bob Guest', email: 'bob@example.com', role: 'guest', profilePhoto: 'https://i.pravatar.cc/150?u=bob', createdAt: now },
  { id: '3', name: 'Carol Host', email: 'carol@example.com', role: 'host', profilePhoto: 'https://i.pravatar.cc/150?u=carol', createdAt: now },
  { id: '4', name: 'Admin User', email: 'admin@example.com', role: 'admin', profilePhoto: '', createdAt: now },
];

export const mockProperties: Property[] = [
  {
    id: '1', hostId: '1', hostName: 'Alice Host', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Seaside Villa with Private Pool',
    description: 'Enjoy breathtaking ocean views from this modern villa. Features an infinity pool, outdoor kitchen, and direct beach access. Perfect for families or groups looking for a luxury escape.',
    pricePerNight: 250, location: 'Goa, India',
    photos: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    amenities: ['WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'Beach Access'],
    isActive: true, avgRating: 4.8, reviewCount: 24, createdAt: now,
  },
  {
    id: '2', hostId: '1', hostName: 'Alice Host', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Cozy Mountain Cabin',
    description: 'Rustic cabin nestled in the pine forest with a wood-burning fireplace. Hike trails right from your doorstep. Unplug and reconnect with nature.',
    pricePerNight: 120, location: 'Manali, India',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    amenities: ['Fireplace', 'Hiking', 'Kitchen', 'Parking'],
    isActive: true, avgRating: 4.6, reviewCount: 18, createdAt: now,
  },
  {
    id: '3', hostId: '3', hostName: 'Carol Host', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Modern City Loft',
    description: 'Sleek downtown loft with skyline views. Walking distance to restaurants, nightlife, and public transit. Floor-to-ceiling windows with city panorama.',
    pricePerNight: 180, location: 'Mumbai, India',
    photos: [
      'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Gym', 'Elevator'],
    isActive: true, avgRating: 4.9, reviewCount: 31, createdAt: now,
  },
  {
    id: '4', hostId: '3', hostName: 'Carol Host', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Beachfront Bungalow',
    description: 'Wake up to the sound of waves in this charming beachfront bungalow. Private deck with hammock, outdoor shower, and stunning sunsets.',
    pricePerNight: 200, location: 'Kerala, India',
    photos: [
      'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800',
      'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Kitchen', 'Beach Access'],
    isActive: true, avgRating: 4.7, reviewCount: 15, createdAt: now,
  },
  {
    id: '5', hostId: '1', hostName: 'Alice Host', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Heritage Haveli Suite',
    description: 'Experience royal living in this restored heritage haveli. Ornate architecture, rooftop terrace, and traditional Rajasthani hospitality.',
    pricePerNight: 350, location: 'Jaipur, India',
    photos: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Breakfast', 'Parking', 'Rooftop'],
    isActive: true, avgRating: 5.0, reviewCount: 42, createdAt: now,
  },
  {
    id: '6', hostId: '3', hostName: 'Carol Host', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Lakeside Treehouse Retreat',
    description: 'Sleep among the treetops in this magical treehouse overlooking a serene lake. Includes a zip line, canoe, and stargazing deck.',
    pricePerNight: 160, location: 'Udaipur, India',
    photos: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800',
    ],
    amenities: ['WiFi', 'Kitchen', 'Canoe', 'Parking'],
    isActive: true, avgRating: 4.5, reviewCount: 9, createdAt: now,
  },
  {
    id: '7', hostId: '1', hostName: 'Alice Host', hostPhoto: 'https://i.pravatar.cc/150?u=alice',
    title: 'Luxury Penthouse Suite',
    description: 'Top-floor penthouse with panoramic city views, private terrace, and butler service. The ultimate urban luxury experience.',
    pricePerNight: 500, location: 'Delhi, India',
    photos: [
      'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Butler', 'Gym', 'Pool', 'Parking'],
    isActive: true, avgRating: 4.9, reviewCount: 37, createdAt: now,
  },
  {
    id: '8', hostId: '3', hostName: 'Carol Host', hostPhoto: 'https://i.pravatar.cc/150?u=carol',
    title: 'Organic Farm Stay',
    description: 'Live on a working organic farm. Pick fresh vegetables, feed the animals, and enjoy farm-to-table meals. Perfect for families.',
    pricePerNight: 90, location: 'Pune, India',
    photos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    amenities: ['Kitchen', 'Parking', 'Farm Activities', 'Pet Friendly'],
    isActive: true, avgRating: 4.4, reviewCount: 12, createdAt: now,
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1', propertyId: '1', propertyTitle: 'Seaside Villa with Private Pool', propertyPhoto: mockProperties[0].photos[0],
    guestId: '2', guestName: 'Bob Guest', hostId: '1',
    startDate: '2026-08-15', endDate: '2026-08-20',
    status: 'confirmed', createdAt: now,
  },
  {
    id: '2', propertyId: '3', propertyTitle: 'Modern City Loft', propertyPhoto: mockProperties[2].photos[0],
    guestId: '2', guestName: 'Bob Guest', hostId: '3',
    startDate: '2026-09-01', endDate: '2026-09-05',
    status: 'pending', createdAt: now,
  },
  {
    id: '3', propertyId: '2', propertyTitle: 'Cozy Mountain Cabin', propertyPhoto: mockProperties[1].photos[0],
    guestId: '2', guestName: 'Bob Guest', hostId: '1',
    startDate: '2026-07-10', endDate: '2026-07-14',
    status: 'declined', createdAt: now,
  },
];
