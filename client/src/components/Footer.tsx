import { Box, Container, Typography, Link, IconButton } from '@mui/material';
import { GitHub, Instagram, Twitter } from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

export default function Footer() {
  const { darkMode } = useThemeMode();
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        borderTop: '1px solid',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'grey.200',
        bgcolor: darkMode ? '#1A1A1A' : '#fff',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} CozyStay. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}><Twitter fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}><Instagram fontSize="small" /></IconButton>
            <IconButton size="small" sx={{ color: 'text.secondary' }}><GitHub fontSize="small" /></IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
