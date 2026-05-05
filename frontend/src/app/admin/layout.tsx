'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    FolderKanban,
    Tags,
    GraduationCap,
    Briefcase,
    Wrench,
    BookOpen,
    BookMarked,
    Link2,
    MessageSquare,
    Images,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/api';
import type { User } from '@/types';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Articles', href: '/admin/articles', icon: FileText },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Tags', href: '/admin/tags', icon: Tags },
    { name: 'Profile Links', href: '/admin/profile-links', icon: Link2 },
    { name: 'Education', href: '/admin/education', icon: GraduationCap },
    { name: 'Coursework', href: '/admin/coursework', icon: BookMarked },
    { name: 'Experience', href: '/admin/experience', icon: Briefcase },
    { name: 'Skills', href: '/admin/skills', icon: Wrench },
    { name: 'Publications', href: '/admin/publications', icon: BookOpen },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Gallery', href: '/admin/gallery', icon: Images },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('admin_sidebar_collapsed');
        if (stored === 'true') setCollapsed(true);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed(prev => {
            localStorage.setItem('admin_sidebar_collapsed', String(!prev));
            return !prev;
        });
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            if (!token) { router.push('/admin-login'); return; }
            try {
                const userData = await getCurrentUser(token);
                if (!userData.is_superuser) throw new Error('Not authorized');
                setUser(userData);
            } catch {
                localStorage.removeItem('auth_token');
                router.push('/admin-login');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        router.push('/admin-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#080808]">
                <p className="font-mono text-xs text-[#444]">// LOADING</p>
            </div>
        );
    }

    if (!user) return null;

    const sidebarW = collapsed ? 'w-16' : 'w-56';
    const mainPl = collapsed ? 'lg:pl-16' : 'lg:pl-56';

    return (
        <div className="min-h-screen bg-[#080808]">
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 ${sidebarW} bg-[#0a0a0a] border-r border-[#1c1c1c] flex flex-col transition-all duration-200
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Header */}
                <div className={`flex items-center border-b border-[#1c1c1c] h-14 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                    {!collapsed && (
                        <Link href="/admin" className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] truncate">
                            [ ADMIN ]
                        </Link>
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            onClick={toggleCollapsed}
                            className="hidden lg:flex p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"
                            title={collapsed ? 'Expand' : 'Collapse'}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 space-y-px px-2">
                    {navigation.map((item) => {
                        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.name : undefined}
                                className={`flex items-center gap-3 px-2 py-2 text-sm transition-colors
                                    ${active
                                        ? 'text-[#c9a84c] bg-[#c9a84c]/5 border-l-2 border-[#c9a84c]'
                                        : 'text-[#555] hover:bg-[#111] hover:text-[#e2d9c8] border-l-2 border-transparent'}
                                    ${collapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {!collapsed && <span className="font-mono text-xs tracking-wide truncate">{item.name.toUpperCase()}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-[#1c1c1c]">
                    {!collapsed && (
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <div className="w-6 h-6 bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-mono text-xs flex-shrink-0">
                                {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] text-[#e2d9c8] truncate">{user.full_name || 'Admin'}</p>
                                <p className="font-mono text-[10px] text-[#444] truncate">{user.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Sign Out' : undefined}
                        className={`flex items-center gap-2 w-full px-2 py-2 font-mono text-xs text-red-400 hover:bg-red-900/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && 'SIGN OUT'}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className={`transition-all duration-200 ${mainPl}`}>
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-[#1c1c1c] h-14 flex items-center px-4 gap-4">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden p-2 text-[#444] hover:text-[#e2d9c8] -ml-2 transition-colors"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1" />
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#444] hover:text-[#c9a84c] transition-colors"
                    >
                        VIEW SITE →
                    </a>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
