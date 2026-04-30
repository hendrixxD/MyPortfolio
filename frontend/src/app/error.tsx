'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const [mounted, setMounted] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    const handleReset = () => {
        setIsResetting(true);
        setTimeout(() => {
            reset();
            setIsResetting(false);
        }, 500);
    };

    return (
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Animated warning gradient background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-red-950/20 animate-pulse" style={{ animationDuration: '4s' }} />
                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className={`relative z-10 max-w-2xl mx-auto px-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Error card */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl">
                    {/* Animated warning icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Error title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200">
                        Something Went Wrong
                    </h1>

                    {/* Error description */}
                    <p className="text-zinc-400 text-center mb-6 text-lg">
                        We encountered an unexpected error while processing your request.
                        Don&apos;t worry, our team has been notified.
                    </p>

                    {/* Error details toggle */}
                    {error.message && (
                        <div className="mb-6">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-center gap-2 mx-auto text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <Bug className="w-4 h-4" />
                                <span>Technical Details</span>
                                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {showDetails && (
                                <div className="mt-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
                                    <pre className="text-xs text-red-400/80 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                                        {error.message}
                                    </pre>
                                    {error.digest && (
                                        <p className="mt-2 text-xs text-zinc-600">
                                            Error ID: {error.digest}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleReset}
                            disabled={isResetting}
                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span>{isResetting ? 'Retrying...' : 'Try Again'}</span>
                        </button>

                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-100 rounded-xl font-semibold transition-all duration-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-black/25 hover:-translate-y-1 border border-zinc-700"
                        >
                            <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span>Go Home</span>
                        </Link>
                    </div>

                    {/* Help text */}
                    <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-sm text-zinc-500">
                            If this problem persists, please{' '}
                            <Link href="/contact" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                                contact support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
