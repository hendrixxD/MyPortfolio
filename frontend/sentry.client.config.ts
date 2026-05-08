import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (production, staging, development)
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when errors occur

  integrations: [
    new Sentry.BrowserTracing({
      // Set custom tags for routes
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter sensitive cookies
    if (event.request?.cookies) {
      event.request.cookies = event.request.cookies.replace(/access_token=[^;]*/g, 'access_token=[Filtered]');
    }

    // Add custom context
    event.tags = {
      ...event.tags,
      app: 'portfolio-frontend',
    };

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    /^Non-Error promise rejection captured/,
    // Network errors
    /^NetworkError/,
    /^Failed to fetch/,
  ],
});
