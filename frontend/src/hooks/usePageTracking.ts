'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/lib/config';

const API_URL = getApiUrl();

/**
 * Hook to track page views for analytics.
 *
 * Automatically sends pageview event to backend when route changes.
 * Excludes admin routes and API calls.
 */
export function usePageTracking() {
    const pathname = usePathname();

    useEffect(() => {
        // Don't track admin routes or auth pages
        if (pathname?.startsWith('/admin') || pathname === '/admin-login') {
            return;
        }

        // Track pageview
        const trackPageView = async () => {
            try {
                await fetch(`${API_URL}/api/v1/tracking/pageview?page=${encodeURIComponent(pathname || '/')}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                // Silent fail - don't break the page if tracking fails
                console.debug('Pageview tracking failed:', error);
            }
        };

        trackPageView();
    }, [pathname]);
}
