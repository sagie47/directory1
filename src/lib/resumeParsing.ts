import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import type { WorkerAvailability } from '@/src/lib/workerProfiles';

export interface ParsedResumeDraft {
  display_name: string | null;
  headline: string | null;
  category_id: string | null;
  city_id: string | null;
  skills: string[];
  years_experience: number | null;
  bio: string | null;
  service_areas: string[];
  rate_label: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

// The full onboarding draft = parsed fields + the fixed-wizard answers.
export interface OnboardingDraft extends ParsedResumeDraft {
  availability: WorkerAvailability;
  open_to_work: boolean;
  resume_file_name: string | null;
}

interface AllowedRef {
  id: string;
  name: string;
}

const DRAFT_STORAGE_KEY = 'worker-onboarding:draft';
const RESUME_DB_NAME = 'worker-onboarding';
const RESUME_STORE = 'resume';
const RESUME_KEY = 'pending-resume';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
// Guard before reading the file into memory / base64 (keeps the edge function's
// ~6MB binary cap in sync and avoids freezing the browser on huge files).
const MAX_RESUME_BYTES = 6 * 1024 * 1024;

function emptyDraft(): ParsedResumeDraft {
  return {
    display_name: null,
    headline: null,
    category_id: null,
    city_id: null,
    skills: [],
    years_experience: null,
    bio: null,
    service_areas: [],
    rate_label: null,
    contact_email: null,
    contact_phone: null,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:<mime>;base64," prefix
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

async function extractDocxText(file: File): Promise<string> {
  // mammoth ships a browser build; import dynamically so it isn't in the main bundle.
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value ?? '';
}

/**
 * Parse a resume into a structured draft via the `parse_resume` edge function.
 * PDFs are sent to Gemini natively; DOCX is converted to text client-side; pasted
 * text is sent as-is. On any failure an empty draft is returned so onboarding can
 * always continue with manual entry.
 */
export async function parseResume(
  input: { file?: File; text?: string },
  categories: AllowedRef[],
  cities: AllowedRef[],
): Promise<{ draft: ParsedResumeDraft; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { draft: emptyDraft(), error: 'Resume parsing is not configured in this environment.' };
  }

  const body: Record<string, unknown> = {
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    cities: cities.map((c) => ({ id: c.id, name: c.name })),
  };

  try {
    if (input.file) {
      const file = input.file;
      if (file.size > MAX_RESUME_BYTES) {
        return { draft: emptyDraft(), error: 'That file is too large (max 6MB). Try a smaller PDF or paste your resume text.' };
      }
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isDocx = file.type === DOCX_MIME || file.name.toLowerCase().endsWith('.docx');

      if (isPdf) {
        body.fileBase64 = await fileToBase64(file);
        body.mimeType = 'application/pdf';
      } else if (isDocx) {
        const text = (await extractDocxText(file)).trim();
        if (!text) {
          return { draft: emptyDraft(), error: 'That document looked empty. Try pasting your resume text.' };
        }
        body.text = text;
      } else {
        return { draft: emptyDraft(), error: 'Unsupported file type. Upload a PDF or DOCX, or paste your resume.' };
      }
    } else if (input.text && input.text.trim()) {
      body.text = input.text.trim();
    } else {
      return { draft: emptyDraft(), error: 'Add a resume file or paste some text first.' };
    }

    const { data, error } = await supabase.functions.invoke('parse_resume', { body });

    if (error) {
      return { draft: emptyDraft(), error: 'We could not read that resume. You can fill the form manually.' };
    }
    if (!data?.success || !data?.draft) {
      return { draft: emptyDraft(), error: data?.error ?? 'We could not read that resume. You can fill the form manually.' };
    }

    return { draft: { ...emptyDraft(), ...(data.draft as ParsedResumeDraft) } };
  } catch (caughtError) {
    // Don't surface raw parser/exception text to users; log for debugging only.
    console.error('Resume parse failed:', caughtError);
    return {
      draft: emptyDraft(),
      error: 'We could not read that resume. You can fill the form manually.',
    };
  }
}

// ---- Draft persistence across the sign-in redirect ----

// Uses localStorage (not sessionStorage): a magic-link sign-in opens a NEW tab,
// where sessionStorage would be empty and the draft lost.
export function saveOnboardingDraft(draft: OnboardingDraft) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage may be unavailable (private mode); onboarding still works in-session.
  }
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ---- Raw resume blob persistence (IndexedDB survives the OAuth redirect) ----

function openResumeDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(RESUME_DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(RESUME_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable.'));
  });
}

export async function saveResumeBlob(file: File): Promise<void> {
  try {
    const db = await openResumeDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RESUME_STORE, 'readwrite');
      tx.objectStore(RESUME_STORE).put(file, RESUME_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Best-effort: if we can't stash the file, publish proceeds without the raw resume.
  }
}

export async function loadResumeBlob(): Promise<File | null> {
  try {
    const db = await openResumeDb();
    const file = await new Promise<File | null>((resolve, reject) => {
      const tx = db.transaction(RESUME_STORE, 'readonly');
      const getReq = tx.objectStore(RESUME_STORE).get(RESUME_KEY);
      getReq.onsuccess = () => resolve((getReq.result as File) ?? null);
      getReq.onerror = () => reject(getReq.error);
    });
    db.close();
    return file;
  } catch {
    return null;
  }
}

export async function clearResumeBlob(): Promise<void> {
  try {
    const db = await openResumeDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RESUME_STORE, 'readwrite');
      tx.objectStore(RESUME_STORE).delete(RESUME_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}
