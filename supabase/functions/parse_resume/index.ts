import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? Deno.env.get('GOOGLE_API_KEY');

const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_TEXT_LENGTH = 40_000;
const MAX_BASE64_LENGTH = 8_000_000; // ~6MB binary

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AllowedRef {
  id: string;
  name: string;
}

interface ParseRequest {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
  categories?: AllowedRef[];
  cities?: AllowedRef[];
}

interface ResumeDraft {
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildInstruction(categories: AllowedRef[], cities: AllowedRef[]) {
  const categoryList = categories.map((c) => `${c.id} = ${c.name}`).join('\n');
  const cityList = cities.map((c) => `${c.id} = ${c.name}`).join('\n');

  return [
    'You extract a tradesperson worker profile from a resume for a local trades directory.',
    'Use ONLY facts present in the resume. Do not invent skills, certifications, employers, or contact info.',
    '',
    'Return a single JSON object with exactly these keys:',
    '{',
    '  "display_name": string|null,        // the person\'s name',
    '  "headline": string|null,            // <=140 chars, e.g. "Red Seal carpenter, 8 yrs framing"',
    '  "category_id": string|null,         // MUST be one of the allowed trade ids below, else null',
    '  "city_id": string|null,             // MUST be one of the allowed city ids below, else null',
    '  "skills": string[],                 // short skill/ticket keywords',
    '  "years_experience": number|null,    // integer years, inferred from history',
    '  "bio": string|null,                 // 2-4 sentence first-person summary built only from the resume',
    '  "service_areas": string[],          // place names mentioned, if any',
    '  "rate_label": string|null,          // pay/rate only if explicitly stated',
    '  "contact_email": string|null,',
    '  "contact_phone": string|null',
    '}',
    '',
    'Allowed trade ids (pick the closest match or null):',
    categoryList || '(none provided)',
    '',
    'Allowed city ids (pick the closest match or null):',
    cityList || '(none provided)',
    '',
    'Never output a category_id or city_id that is not in the lists above. Output JSON only.',
  ].join('\n');
}

function coerceDraft(raw: unknown, categories: AllowedRef[], cities: AllowedRef[]): ResumeDraft {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const categoryIds = new Set(categories.map((c) => c.id));
  const cityIds = new Set(cities.map((c) => c.id));

  const asString = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };
  const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value.map((entry) => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean).slice(0, 30);
  };
  const asYears = (value: unknown): number | null => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.min(70, Math.round(n));
  };

  const categoryId = asString(obj.category_id);
  const cityId = asString(obj.city_id);

  return {
    display_name: asString(obj.display_name),
    headline: asString(obj.headline)?.slice(0, 140) ?? null,
    category_id: categoryId && categoryIds.has(categoryId) ? categoryId : null,
    city_id: cityId && cityIds.has(cityId) ? cityId : null,
    skills: asStringArray(obj.skills),
    years_experience: asYears(obj.years_experience),
    bio: asString(obj.bio),
    service_areas: asStringArray(obj.service_areas),
    rate_label: asString(obj.rate_label),
    contact_email: asString(obj.contact_email),
    contact_phone: asString(obj.contact_phone),
  };
}

function extractJsonObject(text: string): unknown {
  const fenced = text.trim().match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model output.');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  if (!geminiApiKey) {
    return jsonResponse({ success: false, error: 'Resume parsing is not configured.' }, 503);
  }

  let payload: ParseRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400);
  }

  const text = typeof payload.text === 'string' ? payload.text.trim() : '';
  const fileBase64 = typeof payload.fileBase64 === 'string' ? payload.fileBase64 : '';
  const mimeType = typeof payload.mimeType === 'string' ? payload.mimeType : 'application/pdf';
  const categories = Array.isArray(payload.categories) ? payload.categories.filter((c) => c?.id && c?.name) : [];
  const cities = Array.isArray(payload.cities) ? payload.cities.filter((c) => c?.id && c?.name) : [];

  if (!text && !fileBase64) {
    return jsonResponse({ success: false, error: 'Provide resume text or a file.' }, 400);
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return jsonResponse({ success: false, error: 'Resume text is too long.' }, 413);
  }
  if (fileBase64.length > MAX_BASE64_LENGTH) {
    return jsonResponse({ success: false, error: 'Resume file is too large.' }, 413);
  }

  const instruction = buildInstruction(categories, cities);
  const parts: Array<Record<string, unknown>> = [{ text: instruction }];
  if (fileBase64) {
    parts.push({ inlineData: { mimeType, data: fileBase64 } });
  } else {
    parts.push({ text: `RESUME:\n${text}` });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

  let modelText: string;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Gemini error', response.status, body.slice(0, 500));
      return jsonResponse({ success: false, error: 'Could not read the resume right now.' }, 502);
    }

    const data = await response.json();
    modelText = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p?.text ?? '').join('') ?? '';
    if (!modelText.trim()) {
      throw new Error('Empty model response.');
    }
  } catch (error) {
    console.error('Gemini request failed', error);
    return jsonResponse({ success: false, error: 'Could not read the resume right now.' }, 502);
  }

  try {
    const draft = coerceDraft(extractJsonObject(modelText), categories, cities);
    return jsonResponse({ success: true, draft });
  } catch (error) {
    console.error('Resume parse failed', error);
    return jsonResponse({ success: false, error: 'Could not understand the resume. Please fill the form manually.' }, 422);
  }
});
