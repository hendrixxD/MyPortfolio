/**
 * Get the API base URL for the current environment.
 *
 * Returns:
 * - Empty string (relative URLs) when running in browser on production
 * - VERCEL_URL during build time on Vercel
 * - localhost:8000 for local development
 */
export function getApiUrl(): string {
    // If explicitly set, use it
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Browser runtime - use relative URLs (same domain)
    if (typeof window !== 'undefined') {
        // Check if we're on localhost for local dev
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // Production - use relative URLs
        return '';
    }

    // Server-side (build time)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Local development build
    return 'http://localhost:8000';
}
