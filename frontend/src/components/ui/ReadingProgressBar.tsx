'use client';

import { useState, useEffect, useCallback } from 'react';

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const calculateProgress = useCallback(() => {
        const article = document.querySelector('article');
        if (!article) return;

        const articleRect = article.getBoundingClientRect();
        const articleTop = window.scrollY + articleRect.top;
        const articleHeight = article.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY;

        // Calculate how far we've scrolled through the article
        const scrolledIntoArticle = scrollY - articleTop + windowHeight * 0.3;
        const totalScrollableArticle = articleHeight - windowHeight * 0.7;

        let percent = (scrolledIntoArticle / totalScrollableArticle) * 100;
        percent = Math.min(100, Math.max(0, percent));

        setProgress(percent);
        setIsVisible(scrollY > 100);
    }, []);

    useEffect(() => {
        calculateProgress();
        window.addEventListener('scroll', calculateProgress, { passive: true });
        window.addEventListener('resize', calculateProgress, { passive: true });

        return () => {
            window.removeEventListener('scroll', calculateProgress);
            window.removeEventListener('resize', calculateProgress);
        };
    }, [calculateProgress]);

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 h-[3px] bg-zinc-900/50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Progress bar with golden gradient */}
            <div
                className="h-full relative overflow-hidden transition-all duration-150 ease-out"
                style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #B8860B 0%, #DAA520 30%, #FFD700 60%, #F4C430 100%)',
                }}
            >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>

            {/* Glow effect at the end of the progress bar */}
            <div
                className="absolute top-0 h-[3px] w-8 transition-all duration-150"
                style={{
                    left: `calc(${progress}% - 2rem)`,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.8))',
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                    opacity: progress > 0 ? 1 : 0,
                }}
            />
        </div>
    );
}
