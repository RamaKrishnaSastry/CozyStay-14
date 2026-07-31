import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, TextField, Button, Avatar, CircularProgress,
  Divider, Grid, Alert, Chip, IconButton, Badge,
} from '@mui/material';
import {
  SendOutlined, LockOutlined, HourglassEmptyOutlined, CheckCircleOutlined,
  DoneAllOutlined, DoneOutlined, DeleteOutlineOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { messageApi, contactRequestApi } from '../api';
import { useSocket } from '../lib/socket';
import { Conversation, ContactRequest, Message } from '../types';

export default function Messages() {
  const { user } = useAuth();
  const { id: paramConvId } = useParams<{ id: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeMsgs, setActiveMsgs] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const token = useMemo(() => localStorage.getItem('token'), [user?.id]);
  const socket = useSocket(token);

  const loadConversations = useCallback(async () => {
    const [convos, reqs] = await Promise.all([
      messageApi.getConversations(),
      contactRequestApi.getMy(),
    ]);
    setConversations(convos);
    setRequests(reqs);
    return convos;
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadConversations().then((convos) => {
      const initial = paramConvId || convos[0]?.contactRequestId || null;
      setActiveConv(initial);
    }).finally(() => setLoading(false));
  }, [user, paramConvId, loadConversations]);

  useEffect(() => {
    if (!activeConv) {
      setActiveMsgs([]);
      return;
    }
    messageApi.getByRequest(activeConv).then(setActiveMsgs);
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMsgs]);

  const handleSelectConversation = useCallback((contactRequestId: string) => {
    setActiveConv(contactRequestId);
    messageApi.markConversationRead(contactRequestId);
    setConversations((prev) =>
      prev.map((c) =>
        c.contactRequestId === contactRequestId ? { ...c, unread: 0 } : c
      )
    );
  }, []);

  useEffect(() => {
    if (!socket || !activeConv) return;
    socket.emit('join_conversation', { contact_request_id: activeConv });
    return () => {
      socket.emit('leave_conversation', { contact_request_id: activeConv });
    };
  }, [socket, activeConv]);

  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (msg: Message) => {
      if (msg.senderId === user.id) return;
      if (msg.contactRequestId === activeConv) {
        setActiveMsgs((prev) => [...prev, msg]);
        socket.emit('mark_read', { contact_request_id: msg.contactRequestId });
        setConversations((prev) =>
          prev.map((c) =>
            c.contactRequestId === msg.contactRequestId
              ? { ...c, lastMessage: msg.deleted ? '(deleted)' : msg.text, lastMessageAt: msg.createdAt, unread: 0 }
              : c
          )
        );
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.contactRequestId === msg.contactRequestId
              ? { ...c, lastMessage: msg.deleted ? '(deleted)' : msg.text, lastMessageAt: msg.createdAt, unread: c.unread + 1 }
              : c
          )
        );
      }
    };

    const onMessagesRead = (data: { contact_request_id: string; by_user_id: string }) => {
      setActiveMsgs((prev) =>
        prev.map((m) =>
          m.senderId === user.id && m.contactRequestId === data.contact_request_id && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m
        )
      );
    };

    const onMessageDeleted = (data: { message_id: string }) => {
      setActiveMsgs((prev) =>
        prev.map((m) => (m.id === data.message_id ? { ...m, deleted: true } : m))
      );
    };

    socket.on('new_message', onNewMessage);
    socket.on('messages_read', onMessagesRead);
    socket.on('message_deleted', onMessageDeleted);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('messages_read', onMessagesRead);
      socket.off('message_deleted', onMessageDeleted);
    };
  }, [socket, user, activeConv]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return;
    try {
      const msg = await messageApi.send(activeConv, newMessage.trim());
      setActiveMsgs((prev) => [...prev, msg]);
      setNewMessage('');
      setConversations((prev) =>
        prev.map((c) =>
          c.contactRequestId === activeConv
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt }
            : c
        )
      );
    } catch { /* ignore */ }
  };

  const handleDeleteMessage = async (msg: Message) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messageApi.deleteMessage(msg.id);
      socket?.emit('delete_message', { message_id: msg.id });
      setActiveMsgs((prev) => prev.map((m) => (m.id === msg.id ? { ...m, deleted: true } : m)));
    } catch { /* ignore */ }
  };

  if (!user) {
    return <Container sx={{ py: 4 }}><Typography>Please log in to view messages.</Typography></Container>;
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const activeRequest = requests.find((r) => r.id === activeConv);
  const conv = conversations.find((c) => c.contactRequestId === activeConv);

  const pendingRequests = user.role === 'host'
    ? requests.filter((r) => r.status === 'pending')
    : [];

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Messages
        {totalUnread > 0 && (
          <Badge badgeContent={totalUnread} color="error" sx={{ ml: 1.5, '& .MuiBadge-badge': { fontSize: 11 } }}>
            <Box sx={{ width: 0 }} />
          </Badge>
        )}
      </Typography>

      {pendingRequests.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          You have {pendingRequests.length} pending contact request{pendingRequests.length > 1 ? 's' : ''}.
          Check your notifications to approve or decline them.
        </Alert>
      )}

      {conversations.length === 0 && requests.filter((r) => r.status === 'pending').length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} icon={<HourglassEmptyOutlined />}>
          Your contact requests are pending host approval. Once approved, you can start messaging.
        </Alert>
      )}

      {conversations.length === 0 && requests.filter((r) => r.status === 'declined').length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} icon={<LockOutlined />}>
          Your contact request was declined.
        </Alert>
      )}

      {conversations.length === 0 && requests.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Browse listings and request to contact a host to start messaging.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No conversations yet</Typography>
              </Box>
            ) : (
              conversations.map((c) => (
                <Box
                  key={c.id}
                  onClick={() => handleSelectConversation(c.contactRequestId)}
                  sx={{
                    p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                    bgcolor: activeConv === c.contactRequestId ? 'action.selected' : 'transparent',
                    borderBottom: '1px solid', borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar src={c.withUserPhoto} sx={{ width: 40, height: 40 }}>
                    {c.withUserName.charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.withUserName}</Typography>
                      {c.unread > 0 && (
                        <Badge badgeContent={c.unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
                          <Box sx={{ width: 0 }} />
                        </Badge>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {c.propertyTitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={c.unread > 0 ? 'text.primary' : 'text.disabled'}
                      noWrap sx={{ display: 'block', fontWeight: c.unread > 0 ? 600 : 400 }}
                    >
                      {c.lastMessage ?? 'No messages yet'}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', height: 520 }}>
            {conv ? (
              <>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={conv.withUserPhoto} sx={{ width: 36, height: 36 }}>
                    {conv.withUserName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {conv.withUserName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conv.propertyTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Chip icon={<CheckCircleOutlined />} label="Connected" color="success" size="small" variant="outlined" />
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activeMsgs.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No messages yet. Start the conversation!
                      </Typography>
                    </Box>
                  )}
                  {activeMsgs.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 0.5 }}>
                        <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5, borderRadius: 2,
                              bgcolor: isMe ? 'primary.main' : 'action.hover',
                              color: isMe ? '#fff' : 'text.primary',
                              opacity: msg.deleted ? 0.55 : 1,
                              fontStyle: msg.deleted ? 'italic' : 'normal',
                            }}
                          >
                            <Typography variant="body2">{msg.deleted ? 'Message deleted' : msg.text}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.3, opacity: 0.7 }}>
                                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              {isMe && !msg.deleted && (
                                msg.readAt ? (
                                  <DoneAllOutlined sx={{ fontSize: 14, opacity: 0.85 }} />
                                ) : (
                                  <DoneOutlined sx={{ fontSize: 14, opacity: 0.55 }} />
                                )
                              )}
                            </Box>
                          </Paper>
                          {isMe && !msg.deleted && msg.readAt && (
                            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3 }}>
                              Read
                            </Typography>
                          )}
                        </Box>
                        {isMe && !msg.deleted && (
                          <IconButton size="small" onClick={() => handleDeleteMessage(msg)}
                            sx={{ alignSelf: 'center', color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                            <DeleteOutlineOutlined fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}
                  <div ref={bottomRef} />
                </Box>

                <Divider />
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth size="small" placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button variant="contained" onClick={handleSend} sx={{ minWidth: 44, px: 2 }}>
                    <SendOutlined fontSize="small" />
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {conversations.length === 0
                    ? 'No conversations available'
                    : 'Select a conversation to start chatting'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
