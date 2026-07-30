import { Router, Response } from 'express';
import Booking from '../models/Booking';
import Property from '../models/Property';
import { AuthRequest, protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/', protect, authorize('guest', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      res.status(404).json({ message: 'Property not found or inactive' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }

    const overlap = await Booking.findOne({
      property: propertyId,
      status: 'confirmed',
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlap) {
      res.status(400).json({ message: 'Dates overlap with an existing confirmed booking' });
      return;
    }

    const booking = await Booking.create({
      property: propertyId,
      guest: req.user!.userId,
      startDate: start,
      endDate: end,
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, authorize('guest', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ guest: req.user!.userId })
      .populate({ path: 'property', populate: { path: 'host', select: 'name' } })
      .sort('-createdAt');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/requests', protect, authorize('host'), async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find({ host: req.user!.userId }).select('_id');
    const propertyIds = properties.map(p => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('guest', 'name email')
      .populate('property', 'title')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/respond', protect, authorize('host', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'pending') {
      res.status(400).json({ message: 'Booking already responded to' });
      return;
    }

    if (req.user!.role !== 'admin' && (booking.property as any).host.toString() !== req.user!.userId) {
      res.status(403).json({ message: 'Not your property' });
      return;
    }

    const { action } = req.body;
    if (!['confirmed', 'declined'].includes(action)) {
      res.status(400).json({ message: 'Action must be confirmed or declined' });
      return;
    }

    booking.status = action;
    await booking.save();
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
