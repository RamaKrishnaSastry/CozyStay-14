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
  host?: { id: string; name: string; email?: string; profilePhoto?: string };
  title: string;
  description: string;
  pricePerNight: number;
  location: string;
  photos: string[];
  amenities: string[];
  isActive: boolean;
  avgRating?: number;
  reviewCount: number;
  createdAt: string;
  blockedDates?: string[];
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPhoto: string;
  guestId: string;
  guestName: string;
  hostId: string;
  hostName?: string;
  property?: { id: string; title: string; photos?: string[]; pricePerNight?: number; location?: string };
  guest?: { id: string; name: string; email: string };
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

export interface ContactRequest {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  guestId: string;
  guestName: string;
  hostId: string;
  hostName?: string;
  status: 'pending' | 'approved' | 'declined';
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  contactRequestId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  readAt?: string;
  deleted?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'contact_request' | 'message' | 'system';
  referenceId: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  contactRequestId: string;
  withUserId: string;
  withUserName: string;
  withUserPhoto: string;
  propertyTitle: string;
  propertyId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
