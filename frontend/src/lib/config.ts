/**
 * Get the API base URL for the current environment.
 *
 * IMPORTANT: No localhost fallbacks in production.
 * deployment.py must set NEXT_PUBLIC_API_URL appropriately.
 */
export function getApiUrl(): string {
    // Priority 1: Explicitly set by deployment
    if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Priority 2: Development mode only
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        // Browser runtime in development
        if (typeof window !== 'undefined') {
            return 'http://localhost:8000';
        }
        // Server-side in development
        return 'http://localhost:8000';
    }

    // Priority 3: Vercel build-time SSR
    if (typeof window === 'undefined' && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Production: fail fast if not configured
    throw new Error(
        'NEXT_PUBLIC_API_URL must be set for production builds. ' +
        'Use deployment.py to generate environment configs.'
    );
}
