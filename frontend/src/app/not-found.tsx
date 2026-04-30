import Link from 'next/link';
import { Home, Search, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Static gradient background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(113, 113, 122, 0.3) 0%, transparent 50%)',
                }}
            />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}
            />

            <div className="text-center px-4 z-10">
                {/* Glowing 404 */}
                <div className="relative mb-8">
                    {/* Glow effect behind text */}
                    <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-zinc-600/20 via-zinc-400/20 to-zinc-600/20 animate-pulse" />

                    {/* Main 404 text */}
                    <h1 className="relative text-[120px] md:text-[180px] lg:text-[220px] font-black leading-none select-none">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-600 drop-shadow-2xl">
                            404
                        </span>
                    </h1>

                    {/* Animated search icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative">
                            <Search className="w-16 h-16 md:w-20 md:h-20 text-zinc-500/50 animate-bounce" />
                            {/* Magnifying glass glow */}
                            <div className="absolute inset-0 blur-md bg-zinc-400/20 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Title with animated underline */}
                <div className="relative inline-block mb-4">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        Page Not Found
                    </h2>
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-zinc-500 to-transparent rounded-full" />
                </div>

                {/* Description */}
                <p className="text-lg md:text-xl text-zinc-400 mb-4 max-w-lg mx-auto">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Helpful hint */}
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 mb-8">
                    <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Let&apos;s get you back on track</span>
                </div>

                {/* Action buttons - using Link only (no onClick needed) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/25 hover:-translate-y-1"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Home className="relative w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="relative">Go Home</span>
                    </Link>

                    <Link
                        href="/projects"
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-100 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-black/25 hover:-translate-y-1 border border-zinc-700"
                    >
                        <span>Browse Projects</span>
                    </Link>
                </div>

                {/* Suggested links */}
                <div className="mt-12 pt-8 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500 mb-4">Or explore these pages:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { name: 'Projects', href: '/projects' },
                            { name: 'Articles', href: '/articles' },
                            { name: 'Contact', href: '/contact' },
                            { name: 'About', href: '/profiles' },
                        ].map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 rounded-full bg-zinc-900 text-zinc-400 text-sm border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
