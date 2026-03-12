import type { SyntheticEvent } from 'react';

const SUPABASE_STORAGE_BUCKET = 'bucket';

function getSupabaseStorageBaseUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    return undefined;
  }

  return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}`;
}

export function preferSupabaseImage(path: string, fallbackSrc: string) {
  const baseUrl = getSupabaseStorageBaseUrl();

  if (!baseUrl) {
    return fallbackSrc;
  }

  const encodedPath = path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${baseUrl}/${encodedPath}`;
}

export function createImageFallbackHandler(fallbackSrc: string) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === 'true') {
      return;
    }

    image.dataset.fallbackApplied = 'true';
    image.src = fallbackSrc;
  };
}
