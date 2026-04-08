import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const CLAIM_EVIDENCE_BUCKET = 'claims';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

interface RequestPayload {
  claim_ids?: string[];
}

interface ClaimRow {
  id: string;
  evidence_urls: string[] | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getFileName(path: string) {
  const segments = path.split('/');
  return segments[segments.length - 1] ?? path;
}

function getExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return null;
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

async function requireAdmin(
  req: Request,
  supabase: ReturnType<typeof createClient>,
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required for admin evidence access');
  }

  const authClient = createClient(supabaseUrl!, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData.user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    return null;
  }

  return userData.user.id;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const adminUserId = await requireAdmin(req, supabase);
    if (!adminUserId) {
      return json({ error: 'Not authorized' }, 403);
    }

    const payload = (await req.json().catch(() => ({}))) as RequestPayload;
    const claimIds = Array.isArray(payload.claim_ids)
      ? [...new Set(payload.claim_ids.filter((claimId): claimId is string => typeof claimId === 'string' && claimId.trim().length > 0))]
      : [];

    if (claimIds.length === 0) {
      return json({ claims: {} });
    }

    const { data, error } = await supabase
      .from('business_claims')
      .select('id, evidence_urls')
      .in('id', claimIds);

    if (error) {
      console.error('Failed to load claim evidence rows:', error);
      return json({ error: 'Unable to load claim evidence.' }, 500);
    }

    const evidenceEntries = await Promise.all(
      ((data ?? []) as ClaimRow[]).map(async (claim) => {
        const evidencePaths = Array.isArray(claim.evidence_urls)
          ? claim.evidence_urls.filter((path): path is string => typeof path === 'string' && path.trim().length > 0)
          : [];

        const files = await Promise.all(
          evidencePaths.map(async (path) => {
            const fileName = getFileName(path);
            const [{ data: openData, error: openError }, { data: downloadData, error: downloadError }] = await Promise.all([
              supabase.storage.from(CLAIM_EVIDENCE_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
              supabase.storage.from(CLAIM_EVIDENCE_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS, {
                download: fileName,
              }),
            ]);

            if (openError) {
              console.error('Failed to create admin open URL for claim evidence:', path, openError);
            }

            if (downloadError) {
              console.error('Failed to create admin download URL for claim evidence:', path, downloadError);
            }

            return {
              path,
              fileName,
              extension: getExtension(fileName),
              openUrl: openData?.signedUrl ?? null,
              downloadUrl: downloadData?.signedUrl ?? null,
            };
          }),
        );

        return [claim.id, files] as const;
      }),
    );

    return json({
      claims: Object.fromEntries(evidenceEntries),
    });
  } catch (error) {
    console.error('Failed to generate admin claim evidence links:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});
