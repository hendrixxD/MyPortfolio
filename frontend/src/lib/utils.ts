import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getApiUrl } from '@/lib/config';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date string
 */
export function formatDate(
    date: string | Date | null | undefined,
    format: 'short' | 'medium' | 'long' | string = 'medium'
): string {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: { month: 'short', day: 'numeric' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
    };

    // Handle custom format strings
    if (format === 'MMMM d, yyyy') {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    return d.toLocaleDateString('en-US', formatOptions[format] || formatOptions.medium);
}

/**
 * Format date range for experience/education
 */
export function formatDateRange(
    startDate: string | null,
    endDate: string | null,
    isCurrent: boolean = false
): string {
    const start = startDate ? formatDateToMonthYear(startDate) : '';

    if (isCurrent) {
        return `${start} - Present`;
    }

    const end = endDate ? formatDateToMonthYear(endDate) : 'Present';
    return `${start} - ${end}`;
}

/**
 * Format date to Month Year format
 */
export function formatDateToMonthYear(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Get reading time display string
 */
export function getReadingTime(minutes: number | null | undefined): string {
    if (!minutes || minutes < 1) return '1 min read';
    return `${minutes} min read`;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Check if we're on the client side
 */
export function isClient(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Get image URL (handles relative paths)
 */
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const apiUrl = getApiUrl();
    return `${apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!isClient()) return false;

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

/**
 * Calculate estimated reading time from text/markdown content
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

/**
 * Generate a random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}
