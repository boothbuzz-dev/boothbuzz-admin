import { supabase } from './supabase';

export type ExhibitorUploadResult = { url: string | null; error: string | null };

/**
 * Upload to exhibitor-images bucket and return a stable public URL (bucket must exist and allow authenticated insert; public read recommended).
 */
export async function uploadExhibitorPublicImage(
  file: File,
  folder: 'portfolio' | 'gallery',
  namePrefix: string
): Promise<ExhibitorUploadResult> {
  const ext = file.name.split('.').pop() || 'jpg';
  const safe = namePrefix.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const filePath = `${folder}/${safe}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage.from('exhibitor-images').upload(filePath, file, {
    upsert: false,
    contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    cacheControl: '3600',
  });
  if (error) {
    const msg = error.message || String(error);
    console.error('Exhibitor image upload failed:', msg, error);
    return { url: null, error: msg };
  }
  const path = data?.path ?? filePath;
  const { data: pub } = supabase.storage.from('exhibitor-images').getPublicUrl(path);
  const publicUrl = pub?.publicUrl ?? null;
  if (!publicUrl) {
    return { url: null, error: 'Could not build public URL for uploaded file' };
  }
  return { url: publicUrl, error: null };
}
