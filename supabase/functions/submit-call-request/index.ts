import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// In-memory rate limiting (per instance). For multi-instance deployment, use Supabase table.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface CallRequestInput {
  offer: string;
  name: string;
  businessName: string;
  trade: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  teamSize?: string;
  primaryNeed: string;
  stripePaymentUrl?: string;
  scheduleUrl?: string;
}

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')?.trim()
    || 'unknown';
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  // Allow various phone formats: (xxx) xxx-xxxx, xxx-xxx-xxxx, xxx.xxx.xxxx, +1xxxxxxxxxx, etc.
  const phoneRegex = /^[\d\s\-().+]+$/;
  const digitCount = (phone.match(/\d/g) ?? []).length;
  return phone.length >= 10 && phone.length <= 20 && phoneRegex.test(phone) && digitCount >= 10;
}

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

function sanitizeString(input: string): string {
  return input.trim().slice(0, 500);
}

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  if (rateLimitMap.size > 100) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

function validateInput(data: CallRequestInput): { valid: boolean; error?: string } {
  // Required fields validation
  const requiredFields = [
    { value: data.offer, name: 'Offer' },
    { value: data.name, name: 'Name' },
    { value: data.businessName, name: 'Business name' },
    { value: data.trade, name: 'Trade' },
    { value: data.city, name: 'City' },
    { value: data.phone, name: 'Phone' },
    { value: data.email, name: 'Email' },
    { value: data.primaryNeed, name: 'Primary need' },
  ];

  for (const field of requiredFields) {
    const error = validateRequired(field.value, field.name);
    if (error) {
      return { valid: false, error };
    }
  }

  // Email format validation
  if (!validateEmail(data.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Phone format validation
  if (!validatePhone(data.phone)) {
    return { valid: false, error: 'Invalid phone format (must be 10-20 digits)' };
  }

  // Offer validation
  if (!['website', 'managed-growth'].includes(data.offer)) {
    return { valid: false, error: 'Invalid offer type' };
  }

  return { valid: true };
}

serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const idempotencyKey = req.headers.get('x-idempotency-key')?.trim() ?? '';
  if (!isUuid(idempotencyKey)) {
    return new Response(JSON.stringify({ error: 'Missing or invalid idempotency key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(clientIp);

  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter: rateLimitResult.retryAfter,
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimitResult.retryAfter),
      },
    });
  }

  // Parse request body
  let body: CallRequestInput;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate input
  const validation = validateInput(body);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check Supabase configuration
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase environment variables missing');
    return new Response(JSON.stringify({ error: 'Service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create service client for privileged operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const existingRequest = await supabase
    .from('call_requests')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingRequest.error) {
    console.error('Failed to check existing call request:', existingRequest.error);
    return new Response(JSON.stringify({ error: 'Failed to submit request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (existingRequest.data) {
    return new Response(JSON.stringify({ success: true, deduplicated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Insert the call request
  const { error: insertError } = await supabase.from('call_requests').insert({
    idempotency_key: idempotencyKey,
    offer: sanitizeString(body.offer),
    name: sanitizeString(body.name),
    business_name: sanitizeString(body.businessName),
    trade: sanitizeString(body.trade),
    city: sanitizeString(body.city),
    phone: sanitizeString(body.phone),
    email: sanitizeString(body.email).toLowerCase(),
    website: body.website ? sanitizeString(body.website) : null,
    team_size: body.teamSize ? sanitizeString(body.teamSize) : null,
    primary_need: sanitizeString(body.primaryNeed),
    stripe_payment_url: body.stripePaymentUrl ? sanitizeString(body.stripePaymentUrl) : null,
    schedule_url: body.scheduleUrl ? sanitizeString(body.scheduleUrl) : null,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return new Response(JSON.stringify({ success: true, deduplicated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Failed to insert call request:', insertError);
    return new Response(JSON.stringify({ error: 'Failed to submit request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
