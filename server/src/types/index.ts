import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  role: 'guest' | 'host' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export type UserRole = 'guest' | 'host' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'declined';
