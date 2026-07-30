import { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, CircularProgress, Chip, Button,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Grid,
} from '@mui/material';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { adminApi, userApi } from '../api';
import { User, Property, Booking } from '../types';

const statusColors: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'success',
  declined: 'error',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTab = (t: number) => {
    setLoading(true);
    const tasks: Record<number, Promise<any>> = {
      0: adminApi.getStats().then(setStats),
      1: userApi.getAll().then(setUsers),
      2: adminApi.getListings().then(setListings),
      3: adminApi.getBookings().then(setBookings),
    };
    (tasks[t] || Promise.resolve()).finally(() => setLoading(false));
  };

  useEffect(() => { loadTab(tab); }, [tab]);

  const handleUpdateUser = async () => {
    if (!editUser) return;
    await userApi.update(editUser.id, { name: editUser.name, email: editUser.email, role: editUser.role as User['role'] });
    setEditUser(null);
    setUsers(await userApi.getAll());
  };

  const handleDeleteUser = async (id: string) => {
    await userApi.delete(id);
    setDeleteConfirm(null);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleDeactivateListing = async (id: string) => {
    await adminApi.deleteListing(id);
    setListings(listings.map(l => l.id === id ? { ...l, isActive: false } : l));
  };

  const handleDeleteBooking = async (id: string) => {
    await adminApi.deleteBooking(id);
    setBookings(bookings.filter(b => b.id !== id));
  };

  const tabs = ['Stats', 'Users', 'Listings', 'Bookings'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Admin Dashboard</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        {tabs.map(t => <Tab key={t} label={t} />)}
      </Tabs>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}

      {!loading && tab === 0 && stats && (
        <Grid container spacing={2}>
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Active Listings', value: stats.totalActiveListings },
            { label: 'Total Bookings', value: stats.totalBookings },
          ].map((s) => (
            <Grid key={s.label} size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && tab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  {editUser?.id === u.id ? (
                    <>
                      <TableCell><TextField size="small" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} /></TableCell>
                      <TableCell><TextField size="small" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} /></TableCell>
                      <TableCell>
                        <Select size="small" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                          <MenuItem value="guest">Guest</MenuItem>
                          <MenuItem value="host">Host</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" onClick={handleUpdateUser} sx={{ mr: 1 }}>Save</Button>
                        <Button size="small" onClick={() => setEditUser(null)}>Cancel</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip label={u.role} size="small" /></TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<EditOutlined />} onClick={() => setEditUser({ id: u.id, name: u.name, email: u.email, role: u.role })} sx={{ mr: 1 }}>Edit</Button>
                        <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => setDeleteConfirm(u.id)}>Delete</Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && tab === 2 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.title}</TableCell>
                  <TableCell>{l.hostName}</TableCell>
                  <TableCell>${l.pricePerNight}</TableCell>
                  <TableCell><Chip label={l.isActive ? 'Yes' : 'No'} size="small" color={l.isActive ? 'success' : 'default'} /></TableCell>
                  <TableCell>
                    {l.isActive && (
                      <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => handleDeactivateListing(l.id)}>
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && tab === 3 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell>{b.propertyTitle}</TableCell>
                  <TableCell>{b.guestName}</TableCell>
                  <TableCell>{new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={b.status} size="small" color={statusColors[b.status] || 'default'} /></TableCell>
                  <TableCell>
                    <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => setDeleteConfirm(b.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => {
            if (tab === 1) handleDeleteUser(deleteConfirm!);
            else if (tab === 3) handleDeleteBooking(deleteConfirm!);
            setDeleteConfirm(null);
          }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
