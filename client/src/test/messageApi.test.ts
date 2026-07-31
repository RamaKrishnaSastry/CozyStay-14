import { beforeEach, describe, expect, it } from 'vitest';
import { messageApi } from '../api';

const BOB_TOKEN = 'mock-jwt-2-1';
const ALICE_TOKEN = 'mock-jwt-1-1';

beforeEach(() => {
  localStorage.clear();
});

describe('messageApi.getConversations', () => {
  it('returns only approved conversations for the user', async () => {
    localStorage.setItem('token', BOB_TOKEN);
    const convos = await messageApi.getConversations();
    expect(convos.length).toBeGreaterThanOrEqual(1);
    expect(convos.every((c) => c.contactRequestId === 'cr1' || c.propertyId === '1')).toBe(true);
  });

  it('computes unread count for messages from the other party', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    await messageApi.send('cr1', 'Are you there?');
    localStorage.setItem('token', BOB_TOKEN);
    const convos = await messageApi.getConversations();
    const cr1 = convos.find((c) => c.contactRequestId === 'cr1')!;
    expect(cr1.unread).toBe(1);
    expect(cr1.lastMessage).toBe('Are you there?');
  });
});

describe('messageApi.markConversationRead', () => {
  it('marks messages from the other party as read and zeroes unread', async () => {
    localStorage.setItem('token', ALICE_TOKEN);
    await messageApi.send('cr1', 'New message');
    localStorage.setItem('token', BOB_TOKEN);

    const before = await messageApi.getConversations();
    const cr1Before = before.find((c) => c.contactRequestId === 'cr1')!;
    expect(cr1Before.unread).toBeGreaterThan(0);

    const result = await messageApi.markConversationRead('cr1');
    expect(result.updated).toBe(cr1Before.unread);

    const after = await messageApi.getConversations();
    expect(after.find((c) => c.contactRequestId === 'cr1')!.unread).toBe(0);

    const msgs = await messageApi.getByRequest('cr1');
    const fromAlice = msgs.filter((m) => m.senderId === '1' && m.text === 'New message');
    expect(fromAlice.length).toBe(1);
    expect(fromAlice[0].readAt).toBeTruthy();
  });
});

describe('messageApi.deleteMessage', () => {
  it('soft-deletes a message sent by the current user', async () => {
    localStorage.setItem('token', BOB_TOKEN);
    const sent = await messageApi.send('cr1', 'temp message');
    const deleted = await messageApi.deleteMessage(sent.id);
    expect(deleted.deleted).toBe(true);

    const msgs = await messageApi.getByRequest('cr1');
    expect(msgs.find((m) => m.id === sent.id)!.deleted).toBe(true);
  });
});
