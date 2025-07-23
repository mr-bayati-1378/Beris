import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export function ensureUploadDirs() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const profilesDir = join(uploadsDir, 'profiles');
  const productsDir = join(uploadsDir, 'products');

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  if (!existsSync(profilesDir)) {
    mkdirSync(profilesDir, { recursive: true });
  }

  if (!existsSync(productsDir)) {
    mkdirSync(productsDir, { recursive: true });
  }
} 