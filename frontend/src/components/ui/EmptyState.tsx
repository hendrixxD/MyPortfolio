import { AlertCircle, FileQuestion, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: 'empty' | 'error' | 'search';
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
}

export function EmptyState({ icon = 'empty', title, description, action }: EmptyStateProps) {
    const icons = {
        empty: <Inbox className="h-12 w-12" />,
        error: <AlertCircle className="h-12 w-12" />,
        search: <FileQuestion className="h-12 w-12" />,
    };

    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                {icons[icon]}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {description}
                </p>
            )}
            {action && (
                <Link href={action.href} className="btn-primary">
                    {action.label}
                </Link>
            )}
        </div>
    );
}
