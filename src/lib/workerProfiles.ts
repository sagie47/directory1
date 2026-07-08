import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

export type WorkerProfileStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type WorkerAvailability = 'on_demand' | 'short_term' | 'full_time';

export interface WorkerProfile {
  id: string;
  user_id: string;
  status: WorkerProfileStatus;
  display_name: string;
  headline: string;
  city_id: string;
  category_id: string | null;
  availability: WorkerAvailability;
  service_areas: string[];
  skills: string[];
  rate_label: string | null;
  years_experience: number | null;
  bio: string;
  photo_url: string | null;
  resume_path: string | null;
  open_to_work: boolean;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerProfileInput {
  displayName: string;
  headline: string;
  cityId: string;
  categoryId?: string;
  availability: WorkerAvailability;
  serviceAreas?: string[];
  skills?: string[];
  rateLabel?: string;
  yearsExperience?: number | null;
  bio: string;
  photoUrl?: string | null;
  resumePath?: string | null;
  openToWork?: boolean;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
}

function optionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function assertSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Worker profiles require a configured Supabase environment.');
  }

  return supabase;
}

// crypto.randomUUID is only defined in secure contexts (HTTPS/localhost). Fall
// back so uploads don't crash when testing over plain HTTP on a LAN/mobile IP.
function safeUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function assertUploadable(file: File, allowedMimes: string[], maxBytes: number, label: string) {
  if (file.size > maxBytes) {
    throw new Error(`${label} must be under ${Math.round(maxBytes / (1024 * 1024))}MB.`);
  }
  // Some browsers leave file.type empty; allow when unknown, otherwise enforce.
  if (file.type && !allowedMimes.includes(file.type)) {
    throw new Error(`Unsupported ${label.toLowerCase()} format.`);
  }
}

const PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const RESUME_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function fetchApprovedWorkerProfiles() {
  const client = assertSupabase();
  const { data, error } = await client
    .from('worker_profiles')
    .select('*')
    .eq('status', 'approved')
    .eq('open_to_work', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WorkerProfile[];
}

export async function fetchWorkerProfileById(id: string) {
  const client = assertSupabase();
  const { data, error } = await client
    .from('worker_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as WorkerProfile | null;
}

export async function fetchMyWorkerProfile(userId: string) {
  const client = assertSupabase();
  const { data, error } = await client
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as WorkerProfile | null;
}

export async function upsertWorkerProfile(userId: string, input: WorkerProfileInput) {
  const client = assertSupabase();
  const contactEmail = optionalText(input.contactEmail);
  const contactPhone = optionalText(input.contactPhone);

  if (!contactEmail && !contactPhone) {
    throw new Error('Add an email or phone number so people can contact you.');
  }

  const { data, error } = await client
    .from('worker_profiles')
    .upsert(
      {
        user_id: userId,
        display_name: input.displayName.trim(),
        headline: input.headline.trim(),
        city_id: input.cityId,
        category_id: optionalText(input.categoryId),
        availability: input.availability,
        service_areas: input.serviceAreas ?? [],
        skills: input.skills ?? [],
        rate_label: optionalText(input.rateLabel),
        years_experience:
          input.yearsExperience === undefined || input.yearsExperience === null || !Number.isFinite(input.yearsExperience)
            ? null
            : Math.min(70, Math.max(0, Math.round(input.yearsExperience))),
        bio: input.bio.trim(),
        photo_url: optionalText(input.photoUrl),
        resume_path: optionalText(input.resumePath),
        open_to_work: input.openToWork ?? true,
        contact_name: input.contactName.trim(),
        contact_email: contactEmail,
        contact_phone: contactPhone,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WorkerProfile;
}

export async function uploadWorkerPhoto(userId: string, file: File) {
  const client = assertSupabase();
  assertUploadable(file, PHOTO_MIMES, 5 * 1024 * 1024, 'Photo');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userId}/${safeUuid()}.${extension}`;

  const { error: uploadError } = await client.storage
    .from('worker-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = client.storage.from('worker-photos').getPublicUrl(filePath);
  return data.publicUrl;
}

// Uploads a raw resume to the private `resumes` bucket and returns the storage
// PATH (not a public URL — the bucket is private; admins read via signed URLs).
export async function uploadResume(userId: string, file: File) {
  const client = assertSupabase();
  assertUploadable(file, RESUME_MIMES, 10 * 1024 * 1024, 'Resume');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const filePath = `${userId}/${safeUuid()}.${extension}`;

  const { error: uploadError } = await client.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  return filePath;
}

export async function createResumeSignedUrl(path: string, expiresInSeconds = 60) {
  const client = assertSupabase();
  const { data, error } = await client.storage.from('resumes').createSignedUrl(path, expiresInSeconds);
  if (error) {
    throw new Error(error.message);
  }
  return data.signedUrl;
}

export async function fetchAdminWorkerProfiles() {
  const client = assertSupabase();
  const { data, error } = await client
    .from('worker_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as WorkerProfile[];
}

export async function reviewWorkerProfile(
  profileId: string,
  status: Exclude<WorkerProfileStatus, 'pending'>,
  rejectionReason?: string,
) {
  const client = assertSupabase();
  const { error } = await client.rpc('review_worker_profile', {
    p_profile_id: profileId,
    p_status: status,
    p_rejection_reason: optionalText(rejectionReason),
  });

  if (error) {
    throw new Error(error.message);
  }
}
