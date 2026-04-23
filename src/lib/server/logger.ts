import "server-only";

import * as Sentry from "@sentry/nextjs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

type LogLevel = "info" | "warning" | "error";

type LogContext = {
  requestPath?: string;
  role?: string;
  actorId?: string;
  weddingId?: string;
  vendorId?: string;
  token?: string;
  [key: string]: unknown;
};

function consoleForLevel(level: LogLevel) {
  switch (level) {
    case "warning":
      return console.warn;
    case "error":
      return console.error;
    default:
      return console.log;
  }
}

function sanitizeContext(context?: LogContext) {
  if (!context) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined && value !== null),
  );
}

export async function logSystemEvent(options: {
  level: LogLevel;
  source: string;
  message: string;
  context?: LogContext;
}) {
  const context = sanitizeContext(options.context);
  consoleForLevel(options.level)("[system]", {
    level: options.level,
    source: options.source,
    message: options.message,
    context,
  });

  if (!isSupabaseServiceConfigured()) {
    return;
  }

  try {
    const client = createSupabaseAdminClient();
    await client.from("system_logs").insert({
      level: options.level,
      source: options.source,
      message: context ? `${options.message} ${JSON.stringify(context)}` : options.message,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[system-log-write-failed]", error);
  }
}

export async function captureServerError(
  source: string,
  error: unknown,
  context?: LogContext,
) {
  Sentry.withScope((scope) => {
    const sanitized = sanitizeContext(context);
    if (sanitized) {
      scope.setContext("server", sanitized);
    }
    scope.setTag("source", source);
    Sentry.captureException(error);
  });

  await logSystemEvent({
    level: "error",
    source,
    message: error instanceof Error ? error.message : "Unexpected server error.",
    context,
  });
}
