const PUBLIC_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

export function getSupabaseUrl() {
  const value = process.env[PUBLIC_URL_KEY];

  if (!value) {
    throw new Error(`${PUBLIC_URL_KEY} is not configured.`);
  }

  return value;
}

export function getSupabaseAnonKey() {
  const value = process.env[PUBLIC_ANON_KEY];

  if (!value) {
    throw new Error(`${PUBLIC_ANON_KEY} is not configured.`);
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env[SERVICE_ROLE_KEY];

  if (!value) {
    throw new Error(`${SERVICE_ROLE_KEY} is not configured.`);
  }

  return value;
}

export function isSupabaseConfigured() {
  return Boolean(process.env[PUBLIC_URL_KEY] && process.env[PUBLIC_ANON_KEY]);
}

export function isSupabaseServiceConfigured() {
  return Boolean(process.env[PUBLIC_URL_KEY] && process.env[PUBLIC_ANON_KEY] && process.env[SERVICE_ROLE_KEY]);
}
