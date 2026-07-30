import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');

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
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>

      <div className="oauth-divider"><span>or</span></div>

      {googleError && <div className="error">{googleError}</div>}
      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setGoogleError('Google sign-in failed')}
          size="large"
          text="signin_with"
        />
      </div>

      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
