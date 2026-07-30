import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');

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

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setGoogleError('');
    try {
      await googleLogin(response.credential!);
      navigate('/');
    } catch (err: any) {
      setGoogleError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="page auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error">{error}</div>}
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="guest">Guest</option>
          <option value="host">Host</option>
        </select>
        <button type="submit">Register</button>
      </form>

      <div className="oauth-divider"><span>or</span></div>

      {googleError && <div className="error">{googleError}</div>}
      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setGoogleError('Google sign-in failed')}
          size="large"
          text="signup_with"
        />
      </div>

      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
