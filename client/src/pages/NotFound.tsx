import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { HomeOutlined } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" component={Link} to="/" startIcon={<HomeOutlined />}>
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
}
