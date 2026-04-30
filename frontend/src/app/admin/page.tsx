'use client';

import { useEffect, useState } from 'react';
import { FileText, FolderKanban, MessageSquare, Eye, TrendingUp } from 'lucide-react';

interface DashboardStats {
    articles: number;
    projects: number;
    messages: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        articles: 0,
        projects: 0,
        messages: 0,
    });

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const [articlesRes, projectsRes, messagesRes] = await Promise.all([
                    fetch(`${API_URL}/api/v1/articles/admin?page_size=1`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/api/v1/projects/admin?page_size=1`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_URL}/api/v1/contact/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const articles = await articlesRes.json();
                const projects = await projectsRes.json();
                const messages = await messagesRes.json();

                setStats({
                    articles: articles.total || 0,
                    projects: projects.total || 0,
                    messages: messages.count || 0,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            name: 'Total Articles',
            value: stats.articles,
            icon: FileText,
            color: 'bg-blue-500',
            href: '/admin/articles',
        },
        {
            name: 'Total Projects',
            value: stats.projects,
            icon: FolderKanban,
            color: 'bg-green-500',
            href: '/admin/projects',
        },
        {
            name: 'Unread Messages',
            value: stats.messages,
            icon: MessageSquare,
            color: 'bg-amber-500',
            href: '/admin/messages',
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Welcome back! Here's an overview of your portfolio.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat) => (
                    <a
                        key={stat.name}
                        href={stat.href}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stat.value}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">{stat.name}</p>
                    </a>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Quick Actions
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/articles"
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">New Article</span>
                    </a>
                    <a
                        href="/admin/projects"
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <FolderKanban className="h-5 w-5 text-green-500" />
                        <span className="font-medium">New Project</span>
                    </a>
                    <a
                        href="/admin/messages"
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <MessageSquare className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">View Messages</span>
                    </a>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Eye className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">View Site</span>
                    </a>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-6 text-white">
                <h2 className="text-lg font-semibold mb-2">Portfolio Admin Panel</h2>
                <p className="text-primary-100">
                    Use this dashboard to manage your portfolio content including articles, projects,
                    skills, education, and more. Changes will be reflected on the public site after saving.
                </p>
            </div>
        </div>
    );
}
