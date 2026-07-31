import { AuthResponse, Property, Booking, User, Review, ContactRequest, Message, Notification, Conversation } from '../types';
import { mockUsers, mockProperties, mockBookings, mockReviews, mockContactRequests, mockMessages, mockNotifications } from './mockData';

let users = [...mockUsers];
let properties = [...mockProperties];
let bookings = [...mockBookings];
let reviews = [...mockReviews];
let contactRequests = [...mockContactRequests];
let messages = [...mockMessages];
let notifications = [...mockNotifications];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let tokenCounter = 0;
function generateToken(user: User): string {
  return `mock-jwt-${user.id}-${++tokenCounter}`;
}

function getCurrentUserId(): string {
  const token = localStorage.getItem('token');
  if (!token) return '';
  const match = token.match(/^mock-jwt-(\d+)-/);
  return match ? match[1] : '';
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
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    await delay();
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`);
    const payload = await response.json();
    let user = users.find((u) => u.email === payload.email);
    if (!user) {
      user = {
        id: String(users.length + 1),
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        role: 'guest',
        profilePhoto: payload.picture,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
    }
    return { token: generateToken(user), user };
  },
  getMe: async (): Promise<User> => {
    await delay(200);
    const token = localStorage.getItem('token');
    if (!token) throw { response: { status: 401 } };
    const userId = getCurrentUserId();
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
    const userId = getCurrentUserId();
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
    const guestId = getCurrentUserId() || '';
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
    const guestId = getCurrentUserId() || '';
    return bookings.filter((b) => b.guestId === guestId);
  },
  getRequests: async (): Promise<Booking[]> => {
    await delay();
    const token = localStorage.getItem('token');
    const hostId = getCurrentUserId() || '';
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
    return reviews.filter((r) => r.propertyId === propertyId);
  },
  getByUser: async (userId: string): Promise<Review[]> => {
    await delay(200);
    return reviews.filter((r) => r.userId === userId);
  },
  create: async (data: { bookingId: string; propertyId: string; rating: number; text: string }): Promise<Review> => {
    await delay();
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    const user = users.find((u) => u.id === userId);
    const review: Review = {
      id: `r-${Date.now()}`,
      bookingId: data.bookingId,
      userId,
      userName: user?.name || '',
      propertyId: data.propertyId,
      rating: data.rating,
      text: data.text,
      createdAt: new Date().toISOString(),
    };
    reviews.push(review);
    const prop = properties.find((p) => p.id === data.propertyId);
    if (prop) {
      const propReviews = reviews.filter((r) => r.propertyId === data.propertyId);
      prop.avgRating = Math.round((propReviews.reduce((s, r) => s + r.rating, 0) / propReviews.length) * 10) / 10;
      prop.reviewCount = propReviews.length;
    }
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

export const contactRequestApi = {
  create: async (data: { propertyId: string; message?: string }): Promise<ContactRequest> => {
    await delay();
    const token = localStorage.getItem('token');
    const guestId = getCurrentUserId() || '';
    const user = users.find((u) => u.id === guestId);
    const prop = properties.find((p) => p.id === data.propertyId);
    if (!prop) throw { response: { data: { message: 'Property not found' } } };
    const existing = contactRequests.find(
      (cr) => cr.propertyId === data.propertyId && cr.guestId === guestId && cr.status === 'pending'
    );
    if (existing) throw { response: { data: { message: 'You already have a pending request for this property' } } };
    const cr: ContactRequest = {
      id: `cr-${Date.now()}`,
      propertyId: data.propertyId,
      propertyTitle: prop.title,
      guestId,
      guestName: user?.name || '',
      hostId: prop.hostId,
      hostName: prop.hostName,
      status: 'pending',
      message: data.message,
      createdAt: new Date().toISOString(),
    };
    contactRequests.push(cr);
    const hostNotif: Notification = {
      id: `n-${Date.now()}`,
      userId: prop.hostId,
      type: 'contact_request',
      referenceId: cr.id,
      title: 'New Contact Request',
      message: `${cr.guestName} wants to connect about "${prop.title}"`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(hostNotif);
    return cr;
  },
  getMy: async (role?: string): Promise<ContactRequest[]> => {
    await delay(200);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    if (role === 'host') return contactRequests.filter((cr) => cr.hostId === userId);
    return contactRequests.filter((cr) => cr.guestId === userId);
  },
  respond: async (id: string, action: 'approved' | 'declined'): Promise<ContactRequest> => {
    await delay();
    const idx = contactRequests.findIndex((cr) => cr.id === id);
    if (idx === -1) throw { response: { status: 404 } };
    contactRequests[idx] = { ...contactRequests[idx], status: action, updatedAt: new Date().toISOString() };
    const cr = contactRequests[idx];
    const guestNotif: Notification = {
      id: `n-${Date.now()}`,
      userId: cr.guestId,
      type: 'contact_request',
      referenceId: cr.id,
      title: 'Contact Request Update',
      message: `Your request about "${cr.propertyTitle}" was ${action} by the host.`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(guestNotif);
    return cr;
  },
};

export const messageApi = {
  send: async (contactRequestId: string, text: string): Promise<Message> => {
    await delay();
    const token = localStorage.getItem('token');
    const senderId = getCurrentUserId() || '';
    const sender = users.find((u) => u.id === senderId);
    const cr = contactRequests.find((c) => c.id === contactRequestId);
    if (!cr || cr.status !== 'approved') throw { response: { data: { message: 'Cannot send message' } } };
    const msg: Message = {
      id: `m-${Date.now()}`,
      contactRequestId,
      senderId,
      senderName: sender?.name || '',
      text,
      deleted: false,
      createdAt: new Date().toISOString(),
    };
    messages.push(msg);
    const otherId = cr.hostId === senderId ? cr.guestId : cr.hostId;
    const msgNotif: Notification = {
      id: `n-${Date.now()}`,
      userId: otherId,
      type: 'message',
      referenceId: msg.id,
      title: `New message from ${sender?.name || 'User'}`,
      message: text.slice(0, 100),
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(msgNotif);
    return msg;
  },
  getByRequest: async (contactRequestId: string): Promise<Message[]> => {
    await delay(200);
    return messages
      .filter((m) => m.contactRequestId === contactRequestId)
      .map((m) => ({ ...m, deleted: m.deleted ?? false }));
  },
  markConversationRead: async (contactRequestId: string): Promise<{ updated: number; unread: number }> => {
    await delay(100);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    let updated = 0;
    messages = messages.map((m) => {
      if (m.contactRequestId === contactRequestId && m.senderId !== userId && !m.readAt) {
        updated += 1;
        return { ...m, readAt: new Date().toISOString() };
      }
      return m;
    });
    return { updated, unread: 0 };
  },
  deleteMessage: async (id: string): Promise<Message> => {
    await delay(100);
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) throw { response: { status: 404 } };
    messages[idx] = { ...messages[idx], deleted: true };
    return messages[idx];
  },
  getConversations: async (): Promise<Conversation[]> => {
    await delay(200);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    const approved = contactRequests.filter(
      (cr) => (cr.hostId === userId || cr.guestId === userId) && cr.status === 'approved'
    );
    return approved.map((cr) => {
      const convMsgs = messages
        .filter((m) => m.contactRequestId === cr.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const last = convMsgs[convMsgs.length - 1];
      const otherId = cr.hostId === userId ? cr.guestId : cr.hostId;
      const other = users.find((u) => u.id === otherId);
      const unread = convMsgs.filter((m) => m.senderId !== userId && !m.readAt).length;
      return {
        id: `conv-${cr.id}`,
        contactRequestId: cr.id,
        withUserId: otherId,
        withUserName: other?.name || 'Unknown',
        withUserPhoto: other?.profilePhoto || '',
        propertyTitle: cr.propertyTitle || '',
        propertyId: cr.propertyId,
        lastMessage: last && !last.deleted ? last.text : undefined,
        lastMessageAt: last?.createdAt,
        unread,
      };
    });
  },
};

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    await delay(200);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    return notifications.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getUnreadCount: async (): Promise<number> => {
    await delay(100);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    return notifications.filter((n) => n.userId === userId && !n.read).length;
  },
  markRead: async (id: string): Promise<void> => {
    await delay(100);
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx > -1) notifications[idx] = { ...notifications[idx], read: true };
  },
  markAllRead: async (): Promise<void> => {
    await delay(100);
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId() || '';
    notifications = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  },
  delete: async (id: string): Promise<{ message: string }> => {
    await delay(100);
    notifications = notifications.filter((n) => n.id !== id);
    return { message: 'Notification deleted' };
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
