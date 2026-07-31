import { useState } from 'react';
import {
  Container, Typography, Box, Paper, Avatar, TextField, Button, Alert, Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PhotoUploader from '../components/PhotoUploader';

export default function Profile() {
  const { user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhoto || '');
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('profile-updates') || '{}');
    existing[user.id] = { name, profilePhoto: photoUrl };
    localStorage.setItem('profile-updates', JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>My Profile</Typography>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Avatar
            src={photoUrl}
            sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2.5rem' }}
          >
            {name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {user.role} · Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Display Name" fullWidth value={name}
              onChange={(e) => setName(e.target.value)} size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" fullWidth value={user.email} disabled size="small" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Profile Photo</Typography>
            <PhotoUploader
              value={photoUrl ? [photoUrl] : []}
              onChange={(urls) => setPhotoUrl(urls[0] || '')}
              max={1}
              multiple={false}
              label="Upload photo (mock upload, no platform)"
            />
          </Grid>
        </Grid>

        {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>Profile updated!</Alert>}

        <Button variant="contained" onClick={handleSave} sx={{ px: 4 }}>
          Save Changes
        </Button>
      </Paper>
    </Container>
  );
}
