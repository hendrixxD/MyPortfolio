'use client';

import { useEffect, useState } from 'react';
import { FileText, FolderKanban, MessageSquare } from 'lucide-react';
import { getApiUrl } from '@/lib/config';

interface DashboardStats {
    articles: number;
    projects: number;
    messages: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ articles: 0, projects: 0, messages: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const API_URL = getApiUrl();
                const [articlesRes, projectsRes, messagesRes] = await Promise.all([
                    fetch(`${API_URL}/api/v1/articles/admin?page_size=1`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/v1/projects/admin?page_size=1`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/v1/contact/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const articles = await articlesRes.json();
                const projects = await projectsRes.json();
                const messages = await messagesRes.json();
                setStats({ articles: articles.total || 0, projects: projects.total || 0, messages: messages.count || 0 });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { name: 'ARTICLES', value: stats.articles, icon: FileText, href: '/admin/articles' },
        { name: 'PROJECTS', value: stats.projects, icon: FolderKanban, href: '/admin/projects' },
        { name: 'UNREAD MESSAGES', value: stats.messages, icon: MessageSquare, href: '/admin/messages' },
    ];

    const quickActions = [
        { label: 'ARTICLES', href: '/admin/articles', icon: FileText },
        { label: 'PROJECTS', href: '/admin/projects', icon: FolderKanban },
        { label: 'MESSAGES', href: '/admin/messages', icon: MessageSquare },
    ];

    return (
        <div>
            <div className="mb-8">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-1">[ DASHBOARD ]</p>
                <p className="font-mono text-xs text-[#444]">// portfolio overview</p>
            </div>

            {/* Stat cards */}
            <div className="grid sm:grid-cols-3 gap-px bg-[#1c1c1c] mb-8">
                {statCards.map((stat) => (
                    <a
                        key={stat.name}
                        href={stat.href}
                        className="bg-[#0f0f0f] hover:bg-[#111] transition-colors p-6 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <stat.icon className="h-4 w-4 text-[#444]" />
                            <span className="font-mono text-[10px] tracking-[0.15em] text-[#444]">{stat.name}</span>
                        </div>
                        <span className="font-mono text-3xl font-bold text-[#c9a84c]">{stat.value}</span>
                    </a>
                ))}
            </div>

            {/* Quick actions */}
            <div className="border border-[#1c1c1c]">
                <div className="px-4 py-3 border-b border-[#1c1c1c]">
                    <p className="font-mono text-[10px] tracking-[0.15em] text-[#555]">QUICK ACTIONS</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-px bg-[#1c1c1c]">
                    {quickActions.map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="bg-[#0f0f0f] hover:bg-[#111] transition-colors flex items-center gap-3 px-4 py-4"
                        >
                            <action.icon className="h-4 w-4 text-[#444]" />
                            <span className="font-mono text-xs text-[#888] hover:text-[#e2d9c8] transition-colors">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
