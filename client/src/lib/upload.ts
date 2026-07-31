const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) || file.type.startsWith('image/');
}

export async function mockUpload(file: File): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error('Only image files (JPG, PNG, WebP, GIF) are supported.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 4MB.');
  }
  await new Promise((r) => setTimeout(r, 300));
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read the selected image.'));
    reader.readAsDataURL(file);
  });
}
