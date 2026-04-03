import type { SupabaseClient } from '@supabase/supabase-js';

const CLAIM_EVIDENCE_BUCKET = 'bucket';

interface ClaimEvidenceRecord {
  id: string;
  evidence_urls?: string[] | null;
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
            const { data, error } = await client.storage
              .from(CLAIM_EVIDENCE_BUCKET)
              .createSignedUrl(path, expiresInSeconds);

            if (error) {
              console.error('Failed to create signed URL for evidence:', error);
              return '#';
            }

            return data.signedUrl;
          }),
        );

        return [claim.id, signedUrls] as const;
      }),
  );

  return Object.fromEntries(entries) as Record<string, string[]>;
}
