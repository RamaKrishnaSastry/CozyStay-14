import { useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.ogg'];
const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23ddd"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="18"%3ENo Media%3C/text%3E%3C/svg%3E';

export function isVideoUrl(url: string): boolean {
  const ext = url.split('?')[0].toLowerCase();
  return VIDEO_EXTS.some(e => ext.endsWith(e));
}

interface Props {
  src: string;
  alt?: string;
  className?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

export default function MediaItem({ src, alt = '', className, sx, onClick }: Props) {
  const [errored, setErrored] = useState(false);
  const commonSx = { ...sx, display: 'block' };

  if (errored || !src) {
    return <Box component="img" src={FALLBACK_IMG} alt={alt} className={className} sx={commonSx} onClick={onClick} />;
  }
  if (isVideoUrl(src)) {
    return (
      <Box component="video" src={src} className={className} sx={commonSx}
        controls muted preload="metadata"
        onClick={onClick}
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <Box component="img" src={src} alt={alt} className={className} sx={commonSx}
      onClick={onClick}
      onError={() => setErrored(true)}
    />
  );
}
