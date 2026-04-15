import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  integrations: [
    // This bypasses the 'property does not exist' check by casting to any
    (Sentry as any).replayIntegration ? (Sentry as any).replayIntegration() : new (Sentry as any).Replay(),
  ],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

