'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        plausible?: (...args: any[]) => void;
    }
}

export function useAnalytics() {
    useEffect(() => {
        // Google Analytics
        const gaId = process.env.NEXT_PUBLIC_GA_ID;
        if (gaId && typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', gaId, {
                page_path: window.location.pathname,
            });
        }

        // Plausible Analytics
        const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
        if (plausibleDomain && typeof window !== 'undefined' && window.plausible) {
            window.plausible('pageview');
        }
    }, []);
}

export function trackEvent(event: string, properties?: Record<string, any>) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, properties);
    }

    // Plausible Analytics
    if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(event, { props: properties });
    }
}
