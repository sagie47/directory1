import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

export type ClassifiedKind = 'job' | 'worker';
export type ClassifiedStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type ClassifiedDurationType = 'on_demand' | 'short_term' | 'full_time';

export interface Classified {
  id: string;
  kind: ClassifiedKind;
  status: ClassifiedStatus;
  title: string;
  description: string;
  city_id: string;
  category_id: string | null;
  duration_type: ClassifiedDurationType;
  organization_name: string | null;
  compensation_label: string | null;
  start_date: string | null;
  end_date: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ClassifiedInput {
  kind: ClassifiedKind;
  title: string;
  description: string;
  cityId: string;
  categoryId?: string;
  durationType: ClassifiedDurationType;
  organizationName?: string;
  compensationLabel?: string;
  startDate?: string;
  endDate?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClassifiedResult {
  success: boolean;
  id?: string;
  error?: string;
}

function optionalText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function assertSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Classifieds require a configured Supabase environment.');
  }

  return supabase;
}

export async function submitClassified(input: ClassifiedInput): Promise<ClassifiedResult> {
  try {
    const client = assertSupabase();
    const contactEmail = optionalText(input.contactEmail);
    const contactPhone = optionalText(input.contactPhone);

    if (!contactEmail && !contactPhone) {
      return { success: false, error: 'Add an email or phone number so people can contact you.' };
    }

    const { data, error } = await client
      .from('classifieds')
      .insert({
        kind: input.kind,
        status: 'pending',
        title: input.title.trim(),
        description: input.description.trim(),
        city_id: input.cityId,
        category_id: optionalText(input.categoryId),
        duration_type: input.durationType,
        organization_name: optionalText(input.organizationName),
        compensation_label: optionalText(input.compensationLabel),
        start_date: optionalText(input.startDate),
        end_date: optionalText(input.endDate),
        contact_name: input.contactName.trim(),
        contact_email: contactEmail,
        contact_phone: contactPhone,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Classified submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to submit the listing right now.',
    };
  }
}

export async function fetchApprovedClassifieds() {
  const client = assertSupabase();
  const { data, error } = await client
    .from('classifieds')
    .select('*')
    .eq('kind', 'job')
    .eq('status', 'approved')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Classified[];
}

export async function fetchAdminClassifieds() {
  const client = assertSupabase();
  const { data, error } = await client
    .from('classifieds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Classified[];
}

export async function reviewClassified(
  classifiedId: string,
  status: Exclude<ClassifiedStatus, 'pending'>,
  rejectionReason?: string,
) {
  const client = assertSupabase();
  const { error } = await client.rpc('review_classified', {
    p_classified_id: classifiedId,
    p_status: status,
    p_rejection_reason: optionalText(rejectionReason),
  });

  if (error) {
    throw new Error(error.message);
  }
}
