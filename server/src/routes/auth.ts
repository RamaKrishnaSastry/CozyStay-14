import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, protect } from '../middleware/auth';

const router = Router();

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const user = await User.create({ name, email, password, role: role || 'guest' });
    const token = generateToken(user._id as string, user.role);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user._id as string, user.role);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePhoto: user.profilePhoto } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
