import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar, Menu, MenuItem,
  Divider, Container,
} from '@mui/material';
import {
  DarkModeOutlined, LightModeOutlined,
  DashboardOutlined, AddHomeOutlined, BookOnlineOutlined, AdminPanelSettingsOutlined,
  LogoutOutlined, LoginOutlined, PersonAddOutlined, HomeOutlined, ExploreOutlined,
  MessageOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

interface Props {
  onStartTour?: () => void;
}

export default function Navbar({ onStartTour }: Props) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setAnchorEl(null);
  };

  const navItems = user
    ? [
        { label: 'Browse', path: '/', icon: <HomeOutlined sx={{ fontSize: 20 }} /> },
        { label: 'Messages', path: '/messages', icon: <MessageOutlined sx={{ fontSize: 20 }} /> },
        ...(user.role === 'host'
          ? [
              { label: 'Dashboard', path: '/host/dashboard', icon: <DashboardOutlined sx={{ fontSize: 20 }} /> },
              { label: 'Host a Place', path: '/listings/new', icon: <AddHomeOutlined sx={{ fontSize: 20 }} /> },
            ]
          : []),
        ...(user.role === 'guest'
          ? [{ label: 'My Bookings', path: '/my-bookings', icon: <BookOnlineOutlined sx={{ fontSize: 20 }} /> }]
          : []),
        ...(user.role === 'admin'
          ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettingsOutlined sx={{ fontSize: 20 }} /> }]
          : []),
      ]
    : [
        { label: 'Browse', path: '/', icon: <HomeOutlined sx={{ fontSize: 20 }} /> },
      ];

  return (
    <AppBar position="fixed" color="inherit" sx={{ bgcolor: darkMode ? '#1E1E1E' : '#fff' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <HomeOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: -0.5 }}>
              CozyStay
            </Typography>
          </Link>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'grey.100' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          {onStartTour && (
            <Button
              onClick={onStartTour}
              size="small"
              startIcon={<ExploreOutlined />}
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                display: { xs: 'none', sm: 'inline-flex' },
                animation: 'tourPulse 2s infinite',
                '@keyframes tourPulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 },
                },
              }}
            >
              Tour
            </Button>
          )}

          <NotificationBell />

          <IconButton onClick={toggleDarkMode} size="small" sx={{ color: 'text.secondary' }}>
            {darkMode ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>

          {user ? (
            <>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.name}
                </Typography>
              </Box>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  src={user.profilePhoto}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2 } } }}
              >
                <MenuItem disabled>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </MenuItem>
                <Divider />
                {navItems.map((item) => (
                  <MenuItem key={item.path} onClick={() => { navigate(item.path); setAnchorEl(null); }}>
                    {item.icon}
                    <Typography variant="body2" sx={{ ml: 1.5 }}>{item.label}</Typography>
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                  <Avatar src={user.profilePhoto} sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ ml: 1.5 }}>My Profile</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutOutlined sx={{ fontSize: 20 }} />
                  <Typography variant="body2" sx={{ ml: 1.5 }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                size="small"
                startIcon={<LoginOutlined />}
                sx={{ color: 'text.secondary' }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="small"
                startIcon={<PersonAddOutlined />}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
