import { useState, useRef } from 'react';
import {
  Box, TextField, InputAdornment, IconButton, CircularProgress, Chip, Typography, Paper, Grow,
} from '@mui/material';
import { AutoAwesomeOutlined, CloseOutlined, SearchOutlined } from '@mui/icons-material';
import { parseSearchQuery, NLSearchResult } from '../lib/groq';

interface Props {
  onFiltersChange: (filters: NLSearchResult | null) => void;
}

export default function NaturalLanguageSearch({ onFiltersChange }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<NLSearchResult | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    const result = await parseSearchQuery(trimmed);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setActiveFilters(null);
      onFiltersChange(null);
      return;
    }
    setActiveFilters(result);
    onFiltersChange(result);
  };

  const handleClear = () => {
    setQuery('');
    setActiveFilters(null);
    setError('');
    onFiltersChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const filterChips: string[] = [];
  if (activeFilters?.location) filterChips.push(`Location: ${activeFilters.location}`);
  if (activeFilters?.maxPrice) filterChips.push(`Max $${activeFilters.maxPrice}`);
  if (activeFilters?.minPrice) filterChips.push(`Min $${activeFilters.minPrice}`);
  if (activeFilters?.propertyType) filterChips.push(`Type: ${activeFilters.propertyType}`);
  if (activeFilters?.amenities?.length) filterChips.push(`Amenities: ${activeFilters.amenities.join(', ')}`);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          display: 'flex',
          alignItems: 'center',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`,
          borderRadius: 3,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
          },
        }}
      >
        <AutoAwesomeOutlined sx={{ ml: 1.5, color: 'primary.main', fontSize: 20 }} />
        <TextField
          fullWidth
          placeholder='Try "beach house in Goa under $200 with pool" or "mountain cabin with fireplace"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          slotProps={{ input: { disableUnderline: true, sx: { px: 1, py: 0.5, fontSize: '0.95rem' } } }}
          sx={{ '& .MuiInputBase-root': { bgcolor: 'transparent' } }}
        />
        {loading ? (
          <CircularProgress size={20} sx={{ mr: 1 }} />
        ) : query ? (
          <IconButton size="small" onClick={handleClear} sx={{ mr: 0.5 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        ) : null}
        <IconButton
          size="small"
          onClick={handleSearch}
          sx={{ mr: 0.5, bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <SearchOutlined fontSize="small" />
        </IconButton>
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', ml: 1 }}>
          {error}
        </Typography>
      )}

      {activeFilters && filterChips.length > 0 && (
        <Grow in>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {filterChips.map((chip) => (
              <Chip key={chip} label={chip} size="small" color="primary" variant="outlined" />
            ))}
            <Chip
              label="Clear filters"
              size="small"
              onDelete={handleClear}
              sx={{ '& .MuiChip-deleteIcon': { fontSize: 14 } }}
            />
          </Box>
        </Grow>
      )}
    </Box>
  );
}
