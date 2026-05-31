import "server-only";

function getEnv(name: string) {
  return process.env[name];
}

export function getOptionalServerEnv(name: string) {
  return getEnv(name);
}

export function getRequiredServerEnv(name: string) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function readNumericEnv(name: string, fallback: number) {
  const value = getEnv(name);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRateLimitConfig() {
  return {
    login: {
      max: readNumericEnv("RATE_LIMIT_LOGIN_MAX", 5),
      windowMs: readNumericEnv("RATE_LIMIT_LOGIN_WINDOW_MS", 15 * 60 * 1000),
    },
    register: {
      max: readNumericEnv("RATE_LIMIT_REGISTER_MAX", 5),
      windowMs: readNumericEnv("RATE_LIMIT_REGISTER_WINDOW_MS", 60 * 60 * 1000),
    },
    rsvp: {
      max: readNumericEnv("RATE_LIMIT_RSVP_MAX", 10),
      windowMs: readNumericEnv("RATE_LIMIT_RSVP_WINDOW_MS", 60 * 60 * 1000),
    },
    table: {
      max: readNumericEnv("RATE_LIMIT_TABLE_MAX", 20),
      windowMs: readNumericEnv("RATE_LIMIT_TABLE_WINDOW_MS", 60 * 60 * 1000),
    },
    upload: {
      max: readNumericEnv("RATE_LIMIT_UPLOAD_MAX", 20),
      windowMs: readNumericEnv("RATE_LIMIT_UPLOAD_WINDOW_MS", 60 * 60 * 1000),
    },
    adminMutation: {
      max: readNumericEnv("RATE_LIMIT_ADMIN_MUTATION_MAX", 60),
      windowMs: readNumericEnv("RATE_LIMIT_ADMIN_MUTATION_WINDOW_MS", 60 * 60 * 1000),
    },
  };
}

export function getCronSecret() {
  return getRequiredServerEnv("CRON_SECRET");
}
