'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { login } from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if already authenticated by trying to access /api/v1/auth/me
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/v1/auth/me', {
                    credentials: 'include', // Include cookies
                });
                if (response.ok) {
                    router.push('/admin');
                }
            } catch {
                // Not authenticated, stay on login page
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ email, password });
            // Cookie is set automatically by backend, no localStorage needed
            router.push('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080808] py-12 px-4">
            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="mb-8">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-1">[ ADMIN ]</p>
                    <p className="font-mono text-xs text-[#444]">// sign in to continue</p>
                </div>

                {/* Form */}
                <div className="border border-[#1c1c1c] p-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-5 border border-red-800/40 bg-red-900/10 text-red-400">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <p className="font-mono text-xs">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block font-mono text-[10px] tracking-[0.1em] text-[#555] mb-1.5 uppercase">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field"
                                placeholder="admin@example.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block font-mono text-[10px] tracking-[0.1em] text-[#555] mb-1.5 uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-field pr-10"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors p-1"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c9a84c] text-[#080808] font-mono text-xs hover:bg-[#d4b56a] transition-colors disabled:opacity-60 mt-2"
                        >
                            {loading ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> SIGNING IN...</>
                            ) : (
                                <><LogIn className="h-3.5 w-3.5" /> SIGN IN</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back */}
                <p className="mt-6 font-mono text-xs text-center">
                    <a href="/" className="text-[#444] hover:text-[#c9a84c] transition-colors">
                        ← BACK TO SITE
                    </a>
                </p>
            </div>
        </div>
    );
}
