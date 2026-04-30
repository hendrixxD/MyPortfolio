'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundClient() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
                href="/"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-white/25 hover:-translate-y-1"
            >
                <span className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Home className="relative w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="relative">Go Home</span>
            </Link>

            <button
                onClick={() => window.history.back()}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-zinc-800 text-zinc-100 rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-black/25 hover:-translate-y-1 border border-zinc-700"
            >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>Go Back</span>
            </button>
        </div>
    );
}
