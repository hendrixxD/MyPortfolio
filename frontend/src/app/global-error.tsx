'use client';

import { useEffect, useState } from 'react';
import { ServerCrash, RefreshCw, Home, AlertOctagon, Zap } from 'lucide-react';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    const [mounted, setMounted] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.error('Global Error:', error);
    }, [error]);

    const handleReset = () => {
        setIsResetting(true);
        setTimeout(() => {
            reset();
        }, 500);
    };

    return (
        <html lang="en">
            <body className="bg-zinc-950 text-zinc-50 font-sans antialiased">
                <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Dramatic red gradient background for server error */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-zinc-950 to-zinc-900" />
                        {/* Animated danger orbs */}
                        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                    </div>

                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-10">
                        <div className="absolute inset-0" style={{
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                        }} />
                    </div>

                    {/* Content */}
                    <div className={`relative z-10 max-w-3xl mx-auto px-4 py-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {/* Error code display */}
                        <div className="text-center mb-8">
                            <div className="relative inline-block">
                                {/* Glow effect */}
                                <div className="absolute inset-0 blur-3xl bg-red-500/30 animate-pulse" />

                                {/* 500 text */}
                                <h1 className="relative text-[100px] md:text-[160px] lg:text-[200px] font-black leading-none select-none">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-red-400 via-red-500 to-red-800 drop-shadow-2xl">
                                        500
                                    </span>
                                </h1>

                                {/* Server crash icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <ServerCrash className="w-16 h-16 md:w-20 md:h-20 text-red-400/40 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Main error card */}
                        <div className="bg-zinc-900/80 backdrop-blur-xl border border-red-900/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-red-500/10">
                            {/* Alert icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                                        <AlertOctagon className="w-8 h-8 text-red-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white">
                                Server Error
                            </h2>

                            {/* Description */}
                            <p className="text-zinc-400 text-center mb-8 max-w-lg mx-auto">
                                We&apos;re experiencing technical difficulties. Our servers encountered a critical error
                                and couldn&apos;t process your request. Please try again in a moment.
                            </p>

                            {/* Status indicator */}
                            <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                                <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                                <span className="text-sm text-zinc-400">
                                    Our team has been automatically notified
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleReset}
                                    disabled={isResetting}
                                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                    <span>{isResetting ? 'Reloading...' : 'Reload Page'}</span>
                                </button>

                                <a
                                    href="/"
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-100 rounded-xl font-semibold transition-all duration-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-black/25 hover:-translate-y-1 border border-zinc-700"
                                >
                                    <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    <span>Go Home</span>
                                </a>
                            </div>

                            {/* Error ID */}
                            {error.digest && (
                                <div className="mt-8 text-center">
                                    <p className="text-xs text-zinc-600">
                                        Error Reference: <code className="px-2 py-1 bg-zinc-950/50 rounded text-zinc-500">{error.digest}</code>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <p className="text-center mt-8 text-sm text-zinc-600">
                            If the problem persists, please try clearing your browser cache or contact support.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
