import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

const shouldEnableSentryBuildPlugin = Boolean(
  process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN,
);

export default shouldEnableSentryBuildPlugin
  ? withSentryConfig(nextConfig, {
      silent: true,
      disableLogger: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  : nextConfig;
