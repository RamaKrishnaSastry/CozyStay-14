import { Router, Response } from 'express';
import Property from '../models/Property';
import Booking from '../models/Booking';
import { AuthRequest, protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { location, maxPrice, amenities } = req.query;
    const filter: any = { isActive: true };

    if (location) filter.location = { $regex: location as string, $options: 'i' };
    if (maxPrice) filter.pricePerNight = { $lte: Number(maxPrice) };
    if (amenities) filter.amenities = { $all: (amenities as string).split(',') };

    const properties = await Property.find(filter).populate('host', 'name');
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id).populate('host', 'name email profilePhoto');
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('host', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, pricePerNight, location, photos, amenities } = req.body;
    const property = await Property.create({
      host: req.user!.userId,
      title,
      description,
      pricePerNight,
      location,
      photos,
      amenities,
    });
    res.status(201).json(property);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.host.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to edit this listing' });
      return;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.host.toString() !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this listing' });
      return;
    }

    const activeBookings = await Booking.countDocuments({
      property: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      endDate: { $gte: new Date() },
    });

    if (activeBookings > 0) {
      res.status(400).json({
        message: `Cannot delete: ${activeBookings} active booking(s) exist. Cancel them first.`,
      });
      return;
    }

    property.isActive = false;
    await property.save();
    res.json({ message: 'Listing deactivated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
