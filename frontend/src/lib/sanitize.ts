/**
 * Input sanitization utilities to prevent XSS attacks
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
        // Server-side: return as-is, sanitization happens client-side
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Sanitize plain text input
 * Strips all HTML tags and dangerous characters
 */
export function sanitizeText(dirty: string): string {
    if (typeof window === 'undefined') {
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitize markdown content before rendering
 * More permissive than plain text but still safe
 */
export function sanitizeMarkdown(dirty: string): string {
    if (typeof window === 'undefined') {
        return dirty;
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'del', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
            'thead', 'tbody', 'tr', 'th', 'td', 'hr'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Validate and sanitize email input
 */
export function sanitizeEmail(email: string): string {
    const sanitized = sanitizeText(email).trim().toLowerCase();
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
    const sanitized = sanitizeText(url).trim();

    // Block dangerous protocols
    const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
    if (dangerousProtocols.test(sanitized)) {
        return '';
    }

    // Only allow http, https, mailto
    const safeProtocols = /^(https?|mailto):/i;
    if (!safeProtocols.test(sanitized) && sanitized.includes(':')) {
        return '';
    }

    return sanitized;
}
