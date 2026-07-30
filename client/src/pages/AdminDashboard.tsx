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

  const endpoints = [
    () => adminApi.getStats().then(setStats),
    () => userApi.getAll().then(setUsers),
    () => adminApi.getListings().then(setListings),
    () => adminApi.getBookings().then(setBookings),
  ];

  useEffect(() => {
    setLoading(true);
    endpoints[tab]().finally(() => setLoading(false));
  }, [tab]);

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
    setListings(listings.map(l => l.id === Number(id) ? { ...l, is_active: false } : l));
  };

  const handleDeleteBooking = async (id: string) => {
    await adminApi.deleteBooking(id);
    setBookings(bookings.filter(b => b.id !== Number(id)));
  };

  const tabs = ['Stats', 'Users', 'Listings', 'Bookings'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} textColor="primary" indicatorColor="primary">
        {tabs.map(t => <Tab key={t} label={t} />)}
      </Tabs>

      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Users</h3><p>{stats.total_users}</p></div>
          <div className="stat-card"><h3>Active Listings</h3><p>{stats.total_active_listings}</p></div>
          <div className="stat-card"><h3>Bookings</h3><p>{stats.total_bookings}</p></div>
        </div>
      )}

      {!loading && tab === 1 && (
        <TableContainer component={Paper}>
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

      {tab === 'listings' && (
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Host</th><th>Price</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.id}>
                <td>{l.title}</td><td>{l.host_name}</td><td>${l.price_per_night}</td><td>{l.is_active ? 'Yes' : 'No'}</td>
                <td>{l.is_active && <button onClick={() => handleDeleteListing(String(l.id))} className="btn-sm btn-danger">Deactivate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'bookings' && (
        <table className="admin-table">
          <thead><tr><th>Property</th><th>Guest</th><th>Dates</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{(b.property as any)?.title}</td><td>{b.guest?.name}</td>
                <td>{new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}</td>
                <td>{b.status}</td>
                <td><button onClick={() => handleDeleteBooking(String(b.id))} className="btn-sm btn-danger">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
