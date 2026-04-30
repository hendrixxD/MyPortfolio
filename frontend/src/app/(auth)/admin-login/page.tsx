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

    // Check if already logged in
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
            router.push('/admin');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login({ email, password });

            // Store token in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', response.access_token);
            }

            // Redirect to dashboard
            router.push('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold gradient-text">lengedandungjoshua</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>

                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input"
                                placeholder="admin@example.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95 p-1 rounded"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 transition-transform duration-200" />
                                    ) : (
                                        <Eye className="h-5 w-5 transition-transform duration-200" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full ${loading ? 'btn-loading' : 'btn-pulse'}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span className="shimmer-loading">Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to site */}
                <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
                    <a
                        href="/"
                        className="link-animated inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 hover:gap-2"
                    >
                        <span className="transition-transform duration-300 hover:-translate-x-1">←</span> Back to site
                    </a>
                </p>
            </div>
        </div>
    );
}
