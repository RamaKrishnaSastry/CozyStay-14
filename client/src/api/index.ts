import axios from 'axios';
import { AuthResponse, Property, Booking, User } from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

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
  getAll: (params?: { location?: string; maxPrice?: number }) =>
    api.get<Property[]>('/properties', { params }).then(r => r.data),
  getById: (id: string) => api.get<Property>(`/properties/${id}`).then(r => r.data),
  create: (data: Partial<Property>) => api.post<Property>('/properties', data).then(r => r.data),
  update: (id: string, data: Partial<Property>) =>
    api.put<Property>(`/properties/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete<{ message: string }>(`/properties/${id}`).then(r => r.data),
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
  getAll: () => api.get<User[]>('/users').then(r => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete<{ message: string }>(`/users/${id}`).then(r => r.data),
};

export const adminApi = {
  getStats: () => api.get<{ total_users: number; total_active_listings: number; total_bookings: number }>('/admin/stats').then(r => r.data),
  getListings: () => api.get<Property[]>('/admin/listings').then(r => r.data),
  getBookings: () => api.get<Booking[]>('/admin/bookings').then(r => r.data),
  deleteListing: (id: string) => api.delete(`/admin/listings/${id}`).then(r => r.data),
  deleteBooking: (id: string) => api.delete(`/admin/bookings/${id}`).then(r => r.data),
};
