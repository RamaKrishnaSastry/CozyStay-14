import { useState, useEffect, useRef, useMemo } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemAvatar, Avatar, Button, Divider,
} from '@mui/material';
import {
  NotificationsOutlined, CheckOutlined, CloseOutlined, DeleteOutlineOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi, contactRequestApi } from '../api';
import { useSocket } from '../lib/socket';
import { Notification } from '../types';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const token = useMemo(() => localStorage.getItem('token'), [user?.id]);
  const socket = useSocket(token);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [all, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifs(all);
      setUnread(count);
    };
    load();
    pollRef.current = setInterval(load, 8000);
    return () => clearInterval(pollRef.current);
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;
    const onNotification = (n: Notification) => {
      setNotifs((prev) => [n, ...prev]);
      if (!n.read) setUnread((prev) => prev + 1);
    };
    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket, user]);

  const handleAction = async (notif: Notification, action: 'approved' | 'declined') => {
    try {
      await contactRequestApi.respond(notif.referenceId, action);
      const [all, count] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifs(all);
      setUnread(count);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const handleClick = async (n: Notification) => {
    if (n.type === 'contact_request' && !n.read) return;
    if (!n.read) await handleMarkRead(n.id);
    if (n.actionUrl) navigate(n.actionUrl);
    handleClose();
  };

  const handleDelete = async (n: Notification) => {
    try {
      await notificationApi.delete(n.id);
      setNotifs((prev) => prev.filter((x) => x.id !== n.id));
      if (!n.read) setUnread((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  if (!user) return null;

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ color: 'text.secondary' }}>
        <Badge badgeContent={unread} color="error" overlap="circular">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{ paper: { sx: { mt: 1, width: 380, maxHeight: 480, borderRadius: 2 } } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
          {unread > 0 && (
            <Button size="small" onClick={async () => {
              await notificationApi.markAllRead();
              setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
              setUnread(0);
            }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifs.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflow: 'auto', maxHeight: 380 }}>
            {notifs.map((n) => (
              <ListItem
                key={n.id}
                sx={{
                  flexDirection: 'column', alignItems: 'stretch',
                  bgcolor: n.read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                  cursor: 'pointer',
                }}
                onClick={() => handleClick(n)}
              >
                <Box sx={{ display: 'flex', gap: 1.5, p: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: n.type === 'contact_request' ? 'warning.main' : 'primary.main', fontSize: '0.9rem' }}>
                      {n.type === 'contact_request' ? 'CR' : 'M'}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{
                      display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ alignSelf: 'center', color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(n); }}>
                    <DeleteOutlineOutlined fontSize="small" />
                  </IconButton>
                  {n.type === 'contact_request' && !n.read && (
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleAction(n, 'approved'); }}>
                        <CheckOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleAction(n, 'declined'); }}>
                        <CloseOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {n.type === 'contact_request' && !n.read && (
                  <Box sx={{ px: 2, pb: 1, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="success" sx={{ flex: 1, textTransform: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleAction(n, 'approved'); }}>
                      Approve
                    </Button>
                    <Button size="small" variant="outlined" color="error" sx={{ flex: 1, textTransform: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleAction(n, 'declined'); }}>
                      Decline
                    </Button>
                  </Box>
                )}
                <Divider />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
