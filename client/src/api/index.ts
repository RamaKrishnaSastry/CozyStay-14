import { AuthResponse, Property, Booking, User, Review } from '../types';
import { mockUsers, mockProperties, mockBookings, mockReviews } from './mockData';

let users = [...mockUsers];
let properties = [...mockProperties];
let bookings = [...mockBookings];
let reviews = [...mockReviews];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let tokenCounter = 0;
function generateToken(user: User): string {
  return `mock-jwt-${user.id}-${++tokenCounter}`;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
  getMe: () => api.get<{ user: User }>('/auth/me').then(r => r.data.user),
  googleLogin: (credential: string) =>
    api.post<AuthResponse>('/auth/google', { credential }).then(r => r.data),
};

export const propertyApi = {
  getAll: async (params?: { location?: string; maxPrice?: number }): Promise<Property[]> => {
    await delay();
    let filtered = properties.filter((p) => p.isActive);
    if (params?.location) {
      const q = params.location.toLowerCase();
      filtered = filtered.filter((p) => p.location.toLowerCase().includes(q));
    }
    if (params?.maxPrice) {
      filtered = filtered.filter((p) => p.pricePerNight <= params.maxPrice!);
    }
    return filtered;
  },
  getById: async (id: string): Promise<Property> => {
    await delay();
    const prop = properties.find((p) => p.id === id);
    if (!prop) throw { response: { status: 404, data: { message: 'Listing not found' } } };
    const propReviews = reviews.filter((r) => r.propertyId === id);
    if (propReviews.length > 0) {
      prop.avgRating = Math.round((propReviews.reduce((s, r) => s + r.rating, 0) / propReviews.length) * 10) / 10;
      prop.reviewCount = propReviews.length;
    }
    return prop;
  },
  create: async (data: Partial<Property>): Promise<Property> => {
    await delay();
    const token = localStorage.getItem('token');
    const userId = token?.split('-')[1];
    const user = users.find((u) => u.id === userId);
    const prop: Property = {
      id: String(properties.length + 1),
      hostId: userId || '',
      hostName: user?.name || '',
      title: data.title || '',
      description: data.description || '',
      pricePerNight: data.pricePerNight || 0,
      location: data.location || '',
      photos: data.photos || [],
      amenities: data.amenities || [],
      isActive: true,
      avgRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    properties.push(prop);
    return prop;
  },
  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    await delay();
    const idx = properties.findIndex((p) => p.id === id);
    if (idx === -1) throw { response: { status: 404 } };
    properties[idx] = { ...properties[idx], ...data };
    return properties[idx];
  },
  delete: async (id: string): Promise<{ message: string }> => {
    await delay();
    const idx = properties.findIndex((p) => p.id === id);
    if (idx > -1) {
      properties[idx] = { ...properties[idx], isActive: false };
    }
    return { message: 'Listing deactivated' };
  },
};

export const bookingApi = {
  create: (data: { property_id: number; start_date: string; end_date: string }) =>
    api.post<Booking>('/bookings', data).then(r => r.data),
  getMy: () => api.get<Booking[]>('/bookings/my').then(r => r.data),
  getRequests: () => api.get<Booking[]>('/bookings/requests').then(r => r.data),
  respond: (id: string, action: 'confirmed' | 'declined') =>
    api.put<Booking>(`/bookings/${id}/respond`, { action }).then(r => r.data),
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    await delay();
    return users;
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay();
    const idx = users.findIndex((u) => u.id === id);
    if (idx > -1) users[idx] = { ...users[idx], ...data };
    return users[idx];
  },
  delete: async (id: string): Promise<{ message: string }> => {
    await delay();
    users = users.filter((u) => u.id !== id);
    return { message: 'User deleted' };
  },
};

export const adminApi = {
  getStats: () => api.get<{ total_users: number; total_active_listings: number; total_bookings: number }>('/admin/stats').then(r => r.data),
  getListings: () => api.get<Property[]>('/admin/listings').then(r => r.data),
  getBookings: () => api.get<Booking[]>('/admin/bookings').then(r => r.data),
  deleteListing: (id: string) => api.delete(`/admin/listings/${id}`).then(r => r.data),
  deleteBooking: (id: string) => api.delete(`/admin/bookings/${id}`).then(r => r.data),
};
