export interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  profilePhoto?: string;
  createdAt: string;
}

export interface Property {
  id: number;
  host_id?: number;
  host_name?: string;
  host?: { id: number; name: string; email?: string; profilePhoto?: string };
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  photos: string[];
  amenities?: string[];
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  property_id?: number;
  guest_id?: number;
  property?: Property | { id: number; title: string };
  guest?: { id: number; name: string; email: string };
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'declined' | 'paid';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
