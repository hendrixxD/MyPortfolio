'use client';

import { useState, useEffect } from 'react';

interface TimeBasedGreetingProps {
    name?: string;
    className?: string;
}

export function TimeBasedGreeting({ name, className = '' }: TimeBasedGreetingProps) {
    const [greeting, setGreeting] = useState('Hello');
    const [emoji, setEmoji] = useState('👋');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const updateGreeting = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning');
                setEmoji('☀️');
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good Afternoon');
                setEmoji('🌤️');
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good Evening');
                setEmoji('🌆');
            } else {
                setGreeting('Good Night');
                setEmoji('🌙');
            }
        };

        updateGreeting();

        // Update greeting every minute to handle time transitions
        const interval = setInterval(updateGreeting, 60000);

        return () => clearInterval(interval);
    }, []);

    // Prevent hydration mismatch by showing a generic greeting until client-side
    if (!mounted) {
        return (
            <span className={className}>
                Hi{name ? `, I'm ${name}` : ''}
            </span>
        );
    }

    return (
        <span className={`${className} inline-flex items-center gap-2 flex-wrap justify-center`}>
            <span className="animate-bounce-subtle">{emoji}</span>
            <span>
                {greeting}
                {name && (
                    <>
                        {', I\'m '}
                        <span className="gradient-text">{name}</span>
                    </>
                )}
            </span>
        </span>
    );
}

// Simplified version without emoji for more formal contexts
export function SimpleTimeGreeting({ className = '' }: { className?: string }) {
    const [greeting, setGreeting] = useState('Hello');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const updateGreeting = () => {
            const hour = new Date().getHours();

            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning');
            } else if (hour >= 12 && hour < 17) {
                setGreeting('Good Afternoon');
            } else if (hour >= 17 && hour < 21) {
                setGreeting('Good Evening');
            } else {
                setGreeting('Good Night');
            }
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) {
        return <span className={className}>Hello</span>;
    }

    return <span className={className}>{greeting}</span>;
}
