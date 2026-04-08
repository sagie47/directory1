import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminClaimEvidenceFile {
  path: string;
  fileName: string;
  extension: string | null;
  openUrl: string | null;
  downloadUrl: string | null;
}

interface AdminClaimEvidenceResponse {
  claims?: Record<string, AdminClaimEvidenceFile[]>;
}

export async function fetchAdminClaimEvidenceMap(
  client: SupabaseClient,
  claimIds: string[],
) {
  if (claimIds.length === 0) {
    return {};
  }

  const { data, error } = await client.functions.invoke('admin_claim_evidence', {
    body: {
      claim_ids: claimIds,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as AdminClaimEvidenceResponse | null)?.claims ?? {}) as Record<string, AdminClaimEvidenceFile[]>;
}
