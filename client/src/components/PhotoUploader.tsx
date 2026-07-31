import { useRef, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { AddPhotoAlternateOutlined, CloseOutlined } from '@mui/icons-material';
import { mockUpload, isImageFile } from '../lib/upload';
import MediaItem from './MediaItem';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  multiple?: boolean;
  label?: string;
}

export default function PhotoUploader({
  value,
  onChange,
  max = 10,
  multiple = true,
  label = 'Upload photos',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const remaining = max - value.length;
      const selected = Array.from(files).slice(0, remaining);
      const invalid = Array.from(files).some((f) => !isImageFile(f));
      if (invalid) setError('Some files were skipped (only images are supported).');
      const urls = await Promise.all(selected.map((f) => mockUpload(f)));
      onChange([...value, ...urls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <CircularProgress size={22} />
        ) : (
          <>
            <AddPhotoAlternateOutlined sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {label} ({value.length}/{max})
            </Typography>
          </>
        )}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {error}
        </Typography>
      )}

      {value.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          {value.map((url, i) => (
            <Box key={`${url.slice(0, 40)}-${i}`} sx={{ position: 'relative', '&:hover .remove': { opacity: 1 } }}>
              <MediaItem src={url} alt={`Upload ${i + 1}`} sx={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 1 }} />
              <IconButton
                className="remove"
                size="small"
                onClick={() => removeAt(i)}
                sx={{
                  position: 'absolute', top: -8, right: -8, opacity: 0,
                  bgcolor: 'error.main', color: '#fff',
                  '&:hover': { bgcolor: 'error.dark' },
                  width: 22, height: 22,
                }}
              >
                <CloseOutlined fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
