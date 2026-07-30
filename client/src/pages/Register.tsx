import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Create account</Typography>
          <Typography variant="body2" color="text.secondary">Join CozyStay today</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          <TextField label="Full Name" fullWidth value={name}
            onChange={(e) => setName(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Email" type="email" fullWidth value={email}
            onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth value={password}
            onChange={(e) => setPassword(e.target.value)} required
            slotProps={{ htmlInput: { minLength: 6 } }} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Role</InputLabel>
            <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="guest">Guest</MenuItem>
              <MenuItem value="host">Host</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" fullWidth size="large" startIcon={<PersonAddOutlined />}>
            Create Account
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">Or sign up with</Typography></Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <GoogleLogin
            onSuccess={(res) => googleLogin(res.credential!)}
            onError={() => setError('Google sign-up failed')}
          />
        </Box>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Already registered? <Link to="/login" style={{ color: 'inherit' }}>Sign in</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
