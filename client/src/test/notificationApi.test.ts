import { beforeEach, describe, expect, it } from 'vitest';
import { notificationApi, contactRequestApi } from '../api';

const ALICE_TOKEN = 'mock-jwt-1-1';

beforeEach(() => {
  localStorage.clear();
});

describe('notificationApi', () => {
  it('returns only notifications for the current user', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    const notifs = await notificationApi.getAll();
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs.every((n) => n.userId === '1')).toBe(true);
  });

  it('reports an unread count', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    const count = await notificationApi.getUnreadCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('marks a single notification as read', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    const notifs = await notificationApi.getAll();
    const target = notifs.find((n) => !n.read)!;
    await notificationApi.markRead(target.id);

    const after = await notificationApi.getAll();
    expect(after.find((n) => n.id === target.id)!.read).toBe(true);
    const count = await notificationApi.getUnreadCount();
    expect(count).toBe(notifs.filter((n) => !n.read).length - 1);
  });

  it('marks all notifications as read', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    await notificationApi.markAllRead();
    const count = await notificationApi.getUnreadCount();
    expect(count).toBe(0);
  });

  it('deletes a notification', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    const before = await notificationApi.getAll();
    const target = before[0];
    await notificationApi.delete(target.id);

    const after = await notificationApi.getAll();
    expect(after.some((n) => n.id === target.id)).toBe(false);
  });
});

describe('contactRequestApi (notification side effects)', () => {
  it('creates a host notification when a request is created', async () => {
    localStorage.setItem('token', 'mock-jwt-8-1');
    const prop = await (await import('../api')).propertyApi.getById('1');
    const req = await contactRequestApi.create({ propertyId: prop.id, message: 'Hi!' });

    localStorage.setItem('token', ALICE_TOKEN);
    const notifs = await notificationApi.getAll();
    expect(notifs.some((n) => n.referenceId === req.id && n.type === 'contact_request')).toBe(true);
  });

  it('creates a guest notification when the host responds', async () => {
    localStorage.setItem('token', 'mock-jwt-5-1');
    const req = await contactRequestApi.create({ propertyId: '1', message: 'Interested!' });

    localStorage.setItem('token', ALICE_TOKEN);
    await contactRequestApi.respond(req.id, 'approved');

    localStorage.setItem('token', 'mock-jwt-5-1');
    const notifs = await notificationApi.getAll();
    expect(notifs.some((n) => n.referenceId === req.id && n.message.includes('was approved'))).toBe(true);
  });
});
