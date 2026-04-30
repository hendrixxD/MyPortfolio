'use client';

import { useEffect } from 'react';

export default function ArticleDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Hide footer when article page is mounted
    useEffect(() => {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }

        // Restore footer when unmounting
        return () => {
            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.display = '';
            }
        };
    }, []);

    return <>{children}</>;
}
