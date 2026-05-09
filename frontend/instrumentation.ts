import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Profiling
      profilesSampleRate: 0.1, // 10% profiling

      // Before send hook to filter sensitive data
      beforeSend(event, hint) {
        // Filter sensitive headers
        if (event.request?.headers) {
          const headers = event.request.headers as Record<string, string>;
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
          app: 'portfolio-frontend-server',
        };

        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  }
}
