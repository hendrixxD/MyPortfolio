import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (production, staging, development)
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

  // Profiling
  profilesSampleRate: 0.1, // 10% profiling

  integrations: [
    // Server-side integrations
  ],

  // Before send hook to filter sensitive data
  beforeSend(event, hint) {
    // Filter sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers;
      if (headers.authorization) {
        headers.authorization = '[Filtered]';
      }
      if (headers.cookie) {
        headers.cookie = headers.cookie.replace(/access_token=[^;]*/g, 'access_token=[Filtered]');
      }
    }

    // Add custom context
    event.tags = {
      ...event.tags,
      app: 'portfolio-frontend',
    };

    return event;
  },
});
