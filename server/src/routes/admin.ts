import { Router, Response } from 'express';
import Property from '../models/Property';
import Booking from '../models/Booking';
import User from '../models/User';
import { AuthRequest, protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const [users, properties, bookings] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments({ isActive: true }),
      Booking.countDocuments(),
    ]);

    res.json({ totalUsers: users, totalActiveListings: properties, totalBookings: bookings });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/listings', protect, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find().populate('host', 'name email').sort('-createdAt');
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bookings', protect, authorize('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('guest', 'name email')
      .populate({ path: 'property', populate: { path: 'host', select: 'name' } })
      .sort('-createdAt');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/listings/:id', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!property) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }
    res.json({ message: 'Listing deactivated by admin' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/bookings/:id', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
