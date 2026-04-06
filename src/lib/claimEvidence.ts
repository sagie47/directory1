import type { SupabaseClient } from '@supabase/supabase-js';

const CLAIM_EVIDENCE_BUCKET = 'claims';
const CLAIM_EVIDENCE_URL_SEGMENTS = [
  `/storage/v1/object/public/${CLAIM_EVIDENCE_BUCKET}/`,
  `/storage/v1/object/authenticated/${CLAIM_EVIDENCE_BUCKET}/`,
  `/storage/v1/object/sign/${CLAIM_EVIDENCE_BUCKET}/`,
];

interface ClaimEvidenceRecord {
  id: string;
  evidence_urls?: string[] | null;
}

export function normalizeClaimEvidencePath(value: string | null | undefined) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
    try {
      const parsedUrl = new URL(trimmedValue);
      const matchedSegment = CLAIM_EVIDENCE_URL_SEGMENTS.find((segment) => parsedUrl.pathname.includes(segment));
      if (!matchedSegment) {
        return null;
      }

      const [, rawPath = ''] = parsedUrl.pathname.split(matchedSegment);
      const normalizedPath = decodeURIComponent(rawPath).replace(/^\/+/, '');
      return normalizedPath || null;
    } catch (error) {
      console.error('Failed to parse claim evidence URL:', error);
      return null;
    }
  }

  const normalizedPath = trimmedValue
    .replace(/^\/+/, '')
    .replace(new RegExp(`^${CLAIM_EVIDENCE_BUCKET}/+`), '');

  return normalizedPath || null;
}

export async function createEvidenceSignedUrlMap(
  client: SupabaseClient,
  claims: ClaimEvidenceRecord[],
  expiresInSeconds = 3600,
) {
  const entries = await Promise.all(
    claims
      .filter((claim) => Array.isArray(claim.evidence_urls) && claim.evidence_urls.length > 0)
      .map(async (claim) => {
        const signedUrls = await Promise.all(
          claim.evidence_urls!.map(async (path) => {
            const normalizedPath = normalizeClaimEvidencePath(path);
            if (!normalizedPath) {
              console.error('Failed to normalize stored evidence reference:', path);
              return null;
            }

            const { data, error } = await client.storage
              .from(CLAIM_EVIDENCE_BUCKET)
              .createSignedUrl(normalizedPath, expiresInSeconds);

            if (error) {
              console.error('Failed to create signed URL for evidence:', error);
              return null;
            }

            return data.signedUrl;
          }),
        );

        return [claim.id, signedUrls] as const;
      }),
  );

  return Object.fromEntries(entries) as Record<string, Array<string | null>>;
}
