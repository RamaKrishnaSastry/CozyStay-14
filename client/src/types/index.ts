export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  profilePhoto?: string;
}

export interface Property {
  _id: string;
  host: { _id: string; name: string; email?: string; profilePhoto?: string };
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  photos: string[];
  amenities?: string[];
  unavailableDates?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  property: Property;
  guest: { _id: string; name: string; email: string };
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
