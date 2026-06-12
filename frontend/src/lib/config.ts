/**
 * Get the API base URL for the current environment.
 *
 * IMPORTANT: No localhost fallbacks in production.
 * deployment.py must set NEXT_PUBLIC_API_URL appropriately.
 */
export function getApiUrl(): string {
    // Priority 1: Explicitly set by deployment
    // Empty string = same domain (monorepo deployment)
    if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Priority 2: Development mode - separate backend
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
        return 'http://localhost:8000';
    }

    // Priority 3: Production monorepo - same domain
    return '';
}
