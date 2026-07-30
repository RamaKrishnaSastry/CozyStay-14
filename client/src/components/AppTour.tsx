import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  MobileStepper, IconButton, Fade,
} from '@mui/material';
import {
  KeyboardArrowLeft, KeyboardArrowRight, Close,
} from '@mui/icons-material';

const tourSteps = [
  {
    title: 'Welcome to CozyStay',
    description: 'Your gateway to unique stays across India. Browse hundreds of curated properties — from beachfront villas in Goa to mountain cabins in Manali and heritage havelis in Jaipur.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=350&fit=crop',
    color: '#FF385C',
  },
  {
    title: 'AI-Powered Natural Search',
    description: 'Describe your ideal stay in plain English! Type something like "beach house in Goa under $200 with pool" and our AI will find matching properties instantly. No more fiddling with filters.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=350&fit=crop',
    color: '#E8583C',
  },
  {
    title: 'Search & Filter by Amenities',
    description: 'Use manual search by location or price, or expand the amenity filters to narrow down by WiFi, pool, pet-friendly, and more. Filter chips show your active selections at a glance.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=350&fit=crop',
    color: '#CC6B3C',
  },
  {
    title: 'Browse Beautiful Listings',
    description: 'Each card shows a hero photo, title, nightly price, location, guest rating, and key amenity chips. Hover for a subtle lift effect. Click any card to dive into full details.',
    image: 'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=600&h=350&fit=crop',
    color: '#B0783C',
  },
  {
    title: 'Listing Details & Gallery',
    description: 'Explore photo galleries with thumbnail navigation. Read full descriptions, check amenities with icons, see host profile, and view the price breakdown for your dates.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=350&fit=crop',
    color: '#E8583C',
  },
  {
    title: 'Reviews & Ratings',
    description: 'Read authentic guest reviews with star ratings before booking. Each review shows the guest name, rating, date, and detailed feedback. See average rating and total review count at a glance.',
    image: 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=600&h=350&fit=crop',
    color: '#FF385C',
  },
  {
    title: 'Booking with Date Picker',
    description: 'Select check-in and check-out dates using the date inputs. See a live price breakdown with total cost before you request. Overlap protection prevents double-booking on confirmed dates.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=350&fit=crop',
    color: '#3C8CFF',
  },
  {
    title: 'Host Dashboard',
    description: 'Hosts can manage all properties from one place: edit listings, delete with confirmation, and respond to booking requests by accepting or declining with a single click.',
    image: 'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=600&h=350&fit=crop',
    color: '#2C9C5F',
  },
  {
    title: 'In-App Messaging',
    description: 'Guests and hosts can communicate directly about bookings, ask questions about properties, and coordinate check-in details — all within the app.',
    image: 'https://images.unsplash.com/photo-1600595956484-37d4e6e30b87?w=600&h=350&fit=crop',
    color: '#6C3CFF',
  },
  {
    title: 'Admin Panel',
    description: 'Admins oversee the entire platform: view stats (users, listings, bookings), manage users with inline editing, deactivate listings, and delete problematic bookings.',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=350&fit=crop',
    color: '#222',
  },
  {
    title: 'Dark Mode',
    description: 'Toggle between light and dark themes anytime using the moon/sun icon. Your preference is saved for next visit. All MUI components adapt seamlessly to the chosen theme.',
    image: 'https://images.unsplash.com/photo-1600586153345-890d3f3b8bd5?w=600&h=350&fit=crop',
    color: '#121212',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AppTour({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [enter, setEnter] = useState(true);
  const maxSteps = tourSteps.length;

  useEffect(() => {
    if (!open) { setStep(0); setEnter(true); }
  }, [open]);

  const animate = (dir: 'next' | 'back') => {
    setEnter(false);
    setTimeout(() => {
      if (dir === 'next' && step < maxSteps - 1) { setStep(step + 1); setEnter(true); }
      if (dir === 'back' && step > 0) { setStep(step - 1); setEnter(true); }
    }, 200);
  };

  const handleClose = () => { onComplete(); onClose(); };
  const current = tourSteps[step];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3, overflow: 'hidden', maxWidth: 520, bgcolor: 'background.paper' } },
      }}
    >
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }} size="small">
        <Close fontSize="small" />
      </IconButton>

      <Box sx={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden' }}>
        <Fade in={enter} timeout={500}>
          <Box
            component="img"
            src={current.image}
            alt={current.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Fade>
        <Box
          sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
            {current.title}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ py: 2.5, px: 3 }}>
        <Fade in={enter} timeout={500}>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {current.description}
          </Typography>
        </Fade>
      </DialogContent>

      <Box sx={{ px: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {step + 1} of {maxSteps}
        </Typography>
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={step}
          sx={{ flex: 1, maxWidth: 240, bgcolor: 'transparent', '& .MuiMobileStepper-dot': { mx: 0.3 }, '& .MuiMobileStepper-dotActive': { bgcolor: 'primary.main' } }}
          nextButton={<span />}
          backButton={<span />}
        />
      </Box>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button size="small" onClick={() => animate('back')} disabled={step === 0} startIcon={<KeyboardArrowLeft />}>
          Back
        </Button>
        <Button size="small" onClick={handleClose} sx={{ color: 'text.secondary' }}>
          Skip
        </Button>
        {step < maxSteps - 1 ? (
          <Button variant="contained" onClick={() => animate('next')} endIcon={<KeyboardArrowRight />}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            Explore Now
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
