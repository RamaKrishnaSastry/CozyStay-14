import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, TextField, Button, Avatar, CircularProgress, Divider, Grid,
} from '@mui/material';
import { SendOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const mockConversations = [
  {
    id: 'conv1', withUserId: '1', withUserName: 'Alice Sharma', withUserPhoto: 'https://i.pravatar.cc/150?u=alice',
    propertyTitle: 'Seaside Villa with Private Pool',
    messages: [
      { id: 'm1', senderId: '2', senderName: 'Bob Patel', text: 'Hi Alice! Is the villa available for August 15-20?', timestamp: '2026-07-01T10:00:00Z' },
      { id: 'm2', senderId: '1', senderName: 'Alice Sharma', text: 'Yes, those dates are free! Would love to host you.', timestamp: '2026-07-01T11:30:00Z' },
      { id: 'm3', senderId: '2', senderName: 'Bob Patel', text: 'Perfect! I just sent a booking request.', timestamp: '2026-07-01T12:00:00Z' },
      { id: 'm4', senderId: '1', senderName: 'Alice Sharma', text: 'Confirmed! See you in August. Let me know if you need airport pickup.', timestamp: '2026-07-01T13:00:00Z' },
    ],
  },
  {
    id: 'conv2', withUserId: '3', withUserName: 'Carol Mehta', withUserPhoto: 'https://i.pravatar.cc/150?u=carol',
    propertyTitle: 'Modern City Loft',
    messages: [
      { id: 'm5', senderId: '2', senderName: 'Bob Patel', text: 'Hi Carol, is the loft pet-friendly?', timestamp: '2026-08-20T09:00:00Z' },
      { id: 'm6', senderId: '3', senderName: 'Carol Mehta', text: 'Yes! Small pets are welcome. There is a pet fee of $25/night.', timestamp: '2026-08-20T10:00:00Z' },
    ],
  },
];

export default function Messages() {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState(mockConversations);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const updated = [...conversations];
    updated[activeConv] = {
      ...updated[activeConv],
      messages: [
        ...updated[activeConv].messages,
        {
          id: `m-${Date.now()}`,
          senderId: user?.id || '2',
          senderName: user?.name || 'Guest',
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setConversations(updated);
    setNewMessage('');
  };

  if (!user) return <Container sx={{ py: 4 }}><Typography>Please log in to view messages.</Typography></Container>;

  const conv = conversations[activeConv];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Messages</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {conversations.map((c, i) => (
              <Box
                key={c.id}
                onClick={() => setActiveConv(i)}
                sx={{
                  p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                  bgcolor: activeConv === i ? 'action.selected' : 'transparent',
                  borderBottom: '1px solid', borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Avatar src={c.withUserPhoto} sx={{ width: 40, height: 40 }}>{c.withUserName.charAt(0)}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.withUserName}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {c.propertyTitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', height: 500 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{conv.withUserName}</Typography>
              <Typography variant="caption" color="text.secondary">{conv.propertyTitle}</Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {conv.messages.map((msg) => {
                const isMe = msg.senderId === user.id || (user.role === 'guest' && msg.senderId === '2');
                return (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5, maxWidth: '75%', borderRadius: 2,
                        bgcolor: isMe ? 'primary.main' : 'action.hover',
                        color: isMe ? '#fff' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.3, opacity: 0.7 }}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}
            </Box>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth size="small" placeholder="Type a message..."
                value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button variant="contained" onClick={handleSend} sx={{ minWidth: 44, px: 2 }}>
                <SendOutlined fontSize="small" />
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
