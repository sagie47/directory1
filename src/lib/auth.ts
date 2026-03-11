import { isSupabaseConfigured, supabase } from './supabase';

export async function hasApprovedClaim(userId: string) {
  if (!supabase || !isSupabaseConfigured()) {
    return false;
  }

  const { count, error } = await supabase
    .from('business_claims')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (error) {
    return false;
  }

  return (count ?? 0) > 0;
}
