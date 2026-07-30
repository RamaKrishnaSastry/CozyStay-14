import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
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
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
          Join CozyStay
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
          Create your account and start exploring
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
          <TextField
            label="Full Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{ htmlInput: { minLength: 6 } }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>I want to</InputLabel>
            <Select value={role} label="I want to" onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="guest">Book stays (Guest)</MenuItem>
              <MenuItem value="host">Host properties (Host)</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            startIcon={<PersonAddOutlined />}
          >
            Register
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#FF385C', fontWeight: 600 }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
