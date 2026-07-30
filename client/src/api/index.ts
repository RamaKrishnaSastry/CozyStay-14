import { AuthResponse, Property, Booking, User, Review } from '../types';
import { mockUsers, mockProperties, mockBookings } from './mockData';

let users = [...mockUsers];
let properties = [...mockProperties];
let bookings = [...mockBookings];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let tokenCounter = 0;
function generateToken(user: User): string {
  return `mock-jwt-${user.id}-${++tokenCounter}`;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> => {
    await delay();
    const exists = users.find((u) => u.email === data.email);
    if (exists) throw { response: { data: { message: 'Email already registered' } } };
    const user: User = {
      id: String(users.length + 1),
      name: data.name,
      email: data.email,
      role: (data.role as User['role']) || 'guest',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return { token: generateToken(user), user };
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    await delay();
    const user = users.find((u) => u.email === data.email);
    if (!user) throw { response: { data: { message: 'Invalid credentials' } } };
    return { token: generateToken(user), user };
  },
  getMe: async (): Promise<User> => {
    await delay(200);
    const token = localStorage.getItem('token');
    if (!token) throw { response: { status: 401 } };
    const userId = token.split('-')[1];
    const user = users.find((u) => u.id === userId);
    if (!user) throw { response: { status: 401 } };
    return user;
  },
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
  create: async (data: { propertyId: string; startDate: string; endDate: string }): Promise<Booking> => {
    await delay();
    const token = localStorage.getItem('token');
    const guestId = token?.split('-')[1] || '';
    const guest = users.find((u) => u.id === guestId);
    const prop = properties.find((p) => p.id === data.propertyId);
    if (!prop) throw { response: { data: { message: 'Property not found' } } };
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw { response: { data: { message: 'End date must be after start date' } } };
    }
    const overlap = bookings.find(
      (b) =>
        b.propertyId === data.propertyId &&
        b.status === 'confirmed' &&
        new Date(b.startDate) < new Date(data.endDate) &&
        new Date(b.endDate) > new Date(data.startDate)
    );
    if (overlap) throw { response: { data: { message: 'These dates are already booked' } } };
    const booking: Booking = {
      id: String(bookings.length + 1),
      propertyId: data.propertyId,
      propertyTitle: prop.title,
      propertyPhoto: prop.photos[0],
      guestId,
      guestName: guest?.name || '',
      hostId: prop.hostId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    bookings.push(booking);
    return booking;
  },
  getMy: async (): Promise<Booking[]> => {
    await delay();
    const token = localStorage.getItem('token');
    const guestId = token?.split('-')[1] || '';
    return bookings.filter((b) => b.guestId === guestId);
  },
  getRequests: async (): Promise<Booking[]> => {
    await delay();
    const token = localStorage.getItem('token');
    const hostId = token?.split('-')[1] || '';
    return bookings.filter((b) => b.hostId === hostId);
  },
  respond: async (id: string, action: 'confirmed' | 'declined'): Promise<Booking> => {
    await delay();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw { response: { status: 404 } };
    bookings[idx] = { ...bookings[idx], status: action };
    return bookings[idx];
  },
};

export const reviewApi = {
  getByProperty: async (propertyId: string): Promise<Review[]> => {
    await delay(200);
    return [];
  },
  create: async (data: { bookingId: string; rating: number; text: string }): Promise<Review> => {
    await delay();
    const token = localStorage.getItem('token');
    const userId = token?.split('-')[1] || '';
    const user = users.find((u) => u.id === userId);
    const review: Review = {
      id: `r-${Date.now()}`,
      bookingId: data.bookingId,
      userId,
      userName: user?.name || '',
      propertyId: '',
      rating: data.rating,
      text: data.text,
      createdAt: new Date().toISOString(),
    };
    return review;
  },
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
  getStats: async (): Promise<{ totalUsers: number; totalActiveListings: number; totalBookings: number }> => {
    await delay();
    return {
      totalUsers: users.length,
      totalActiveListings: properties.filter((p) => p.isActive).length,
      totalBookings: bookings.length,
    };
  },
  getListings: async (): Promise<Property[]> => {
    await delay();
    return properties;
  },
  getBookings: async (): Promise<Booking[]> => {
    await delay();
    return bookings;
  },
  deleteListing: async (id: string): Promise<{ message: string }> => {
    await delay();
    properties = properties.map((p) => (p.id === id ? { ...p, isActive: false } : p));
    return { message: 'Listing deactivated' };
  },
  deleteBooking: async (id: string): Promise<{ message: string }> => {
    await delay();
    bookings = bookings.filter((b) => b.id !== id);
    return { message: 'Booking deleted' };
  },
};
