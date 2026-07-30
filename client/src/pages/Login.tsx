import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box, Divider,
} from '@mui/material';
import { LoginOutlined } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = [
  { label: 'Guest', email: 'guest@demo.com', password: 'demo123' },
  { label: 'Host', email: 'host@demo.com', password: 'demo123' },
  { label: 'Admin', email: 'admin@example.com', password: 'admin123' },
];

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleDemoLogin = async (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    try {
      await login(e, p);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to continue</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          <TextField label="Email" type="email" fullWidth value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }} />
          <Button type="submit" variant="contained" fullWidth size="large" startIcon={<LoginOutlined />}>
            Sign In
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">Or continue with</Typography></Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <GoogleLogin
            onSuccess={(res) => googleLogin(res.credential!)}
            onError={() => setError('Google sign-in failed')}
          />
        </Box>

        <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">Demo accounts</Typography></Divider>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {DEMO_CREDENTIALS.map((d) => (
            <Button key={d.label} size="small" variant="outlined" onClick={() => handleDemoLogin(d.email, d.password)}>
              {d.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No account? <Link to="/register" style={{ color: 'inherit' }}>Register</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
