'use client';

import { usePageTracking } from '@/hooks/usePageTracking';

/**
 * Client component that tracks page views.
 * Add this to the root layout to enable automatic tracking.
 */
export function PageTracker() {
    usePageTracking();
    return null;
}
