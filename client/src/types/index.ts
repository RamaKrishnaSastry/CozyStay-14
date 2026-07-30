export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  profilePhoto?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  photos: string[];
  amenities: string[];
  isActive: boolean;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  blockedDates?: string[];
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPhoto?: string;
  guestId: string;
  guestName: string;
  hostId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'declined' | 'paid';
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  propertyId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
