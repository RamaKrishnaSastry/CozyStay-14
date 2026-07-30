import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box,
  MobileStepper, IconButton, Fade, Slide,
} from '@mui/material';
import {
  KeyboardArrowLeft, KeyboardArrowRight, Close, HomeOutlined,
  SearchOutlined, CardTravelOutlined, BookOnlineOutlined,
  DashboardOutlined, AdminPanelSettingsOutlined, DarkModeOutlined,
  ExploreOutlined, StarBorderOutlined,
} from '@mui/icons-material';

const tourSteps = [
  {
    icon: <HomeOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Welcome to CozyStay',
    description: 'Your gateway to unique stays across India. Browse hundreds of curated properties — from beachfront villas to mountain cabins.',
    highlight: 'hero',
    color: '#FF385C',
  },
  {
    icon: <SearchOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Search & Filter',
    description: 'Find your perfect stay by location or budget. Use the search bar to filter by destination and the price slider to set your nightly budget.',
    highlight: 'search',
    color: '#E8583C',
  },
  {
    icon: <CardTravelOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Browse Listings',
    description: 'Each card shows photos, price, rating, location, and key amenities at a glance. Click any listing to explore details.',
    highlight: 'grid',
    color: '#CC6B3C',
  },
  {
    icon: <ExploreOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Listing Details',
    description: 'View photo galleries, read full descriptions, check amenities with icons, see host info, and book your stay with the date picker.',
    highlight: 'detail',
    color: '#B0783C',
  },
  {
    icon: <StarBorderOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Reviews & Ratings',
    description: 'Read authentic guest reviews with ratings before booking. See what other travelers loved about each property.',
    highlight: 'reviews',
    color: '#E8583C',
  },
  {
    icon: <BookOnlineOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Booking Flow',
    description: 'Request a booking with your dates. Hosts can accept or decline. Track all your bookings — pending, confirmed, or declined — from your account.',
    highlight: 'booking',
    color: '#FF385C',
  },
  {
    icon: <DashboardOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Host Dashboard',
    description: 'Hosts can manage their listings, edit details, delete properties, and respond to booking requests — all from one dashboard.',
    highlight: 'host',
    color: '#3C8CFF',
  },
  {
    icon: <AdminPanelSettingsOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Admin Panel',
    description: 'Admins oversee everything: manage users, deactivate listings, and delete bookings. Stats overview shows platform health at a glance.',
    highlight: 'admin',
    color: '#6C3CFF',
  },
  {
    icon: <DarkModeOutlined sx={{ fontSize: 48, color: '#FF385C' }} />,
    title: 'Dark Mode & More',
    description: 'Toggle between light and dark themes using the moon/sun icon in the navbar. The app remembers your preference.',
    highlight: 'theme',
    color: '#222',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

function SlideTransition(props: any) {
  return <Slide direction="up" {...props} />;
}

export default function AppTour({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [enter, setEnter] = useState(true);
  const maxSteps = tourSteps.length;

  useEffect(() => {
    if (!open) {
      setStep(0);
      setEnter(true);
    }
  }, [open]);

  const handleNext = () => {
    setEnter(false);
    setTimeout(() => {
      if (step < maxSteps - 1) {
        setStep(step + 1);
        setEnter(true);
      }
    }, 200);
  };

  const handleBack = () => {
    setEnter(false);
    setTimeout(() => {
      if (step > 0) {
        setStep(step - 1);
        setEnter(true);
      }
    }, 200);
  };

  const handleClose = () => {
    onComplete();
    onClose();
  };

  const current = tourSteps[step];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slots={{ transition: SlideTransition }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            maxWidth: 480,
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          pt: 4,
          pb: 2,
          px: 3,
          textAlign: 'center',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
              : `linear-gradient(135deg, ${current.color}15 0%, ${current.color}05 100%)`,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
          size="small"
        >
          <Close />
        </IconButton>
        <Fade in={enter} timeout={400}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : `${current.color}15`,
                mb: 1,
                animation: enter ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.08)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              {current.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {current.title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 380, lineHeight: 1.6 }}
            >
              {current.description}
            </Typography>
          </Box>
        </Fade>
      </Box>

      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {step + 1} of {maxSteps}
        </Typography>
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={step}
          sx={{
            flex: 1,
            maxWidth: 200,
            bgcolor: 'transparent',
            '& .MuiMobileStepper-dot': { mx: 0.3 },
            '& .MuiMobileStepper-dotActive': { bgcolor: 'primary.main' },
          }}
          nextButton={<span />}
          backButton={<span />}
        />
      </Box>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button
          size="small"
          onClick={handleBack}
          disabled={step === 0}
          startIcon={<KeyboardArrowLeft />}
        >
          Back
        </Button>
        <Button
          size="small"
          onClick={handleClose}
          sx={{ color: 'text.secondary' }}
        >
          Skip
        </Button>
        {step < maxSteps - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<KeyboardArrowRight />}
          >
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            Get Started
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
