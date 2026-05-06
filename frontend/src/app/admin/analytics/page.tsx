'use client';

import { useEffect, useState } from 'react';
import { Globe, MapPin, FileText, Users, Bot, Eye } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface VisitorStats {
    total_visits: number;
    unique_ips: number;
    bot_visits: number;
    human_visits: number;
    top_countries: Array<{
        country: string;
        country_code: string;
        visit_count: number;
        unique_ips: number;
    }>;
    top_cities: Array<{
        city: string;
        country: string;
        visit_count: number;
        unique_ips: number;
    }>;
    top_pages: Array<{
        path: string;
        visit_count: number;
        unique_ips: number;
    }>;
    recent_visits: Array<{
        id: number;
        country: string;
        city: string;
        path: string;
        created_at: string;
    }>;
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<VisitorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        loadStats();
    }, [days]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const data = await fetchApi<VisitorStats>(`/api/v1/analytics/visitors?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setStats(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#c9a84c] border-r-transparent mb-4"></div>
                    <p className="text-[#999] font-mono text-xs tracking-wider">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-[#999] font-mono text-xs tracking-wider">Failed to load analytics</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-mono text-xl tracking-[0.2em] text-[#c9a84c] mb-2">ANALYTICS</h1>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-[#777] uppercase">
                        Visitor Tracking & Geographic Data
                    </p>
                </div>
                <div>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-[#0a0a0a] border border-[#222] text-[#c9a84c] font-mono text-xs tracking-wider px-4 py-2 rounded hover:border-[#c9a84c] transition-colors"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last 365 days</option>
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="h-5 w-5 text-[#c9a84c]" />
                        <span className="font-mono text-[10px] tracking-[0.15em] text-[#777] uppercase">Total Visits</span>
                    </div>
                    <p className="font-mono text-3xl text-[#c9a84c] font-bold">{stats.total_visits.toLocaleString()}</p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-[#c9a84c]" />
                        <span className="font-mono text-[10px] tracking-[0.15em] text-[#777] uppercase">Unique IPs</span>
                    </div>
                    <p className="font-mono text-3xl text-[#c9a84c] font-bold">{stats.unique_ips.toLocaleString()}</p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="font-mono text-[10px] tracking-[0.15em] text-[#777] uppercase">Human Visits</span>
                    </div>
                    <p className="font-mono text-3xl text-green-500 font-bold">{stats.human_visits.toLocaleString()}</p>
                </div>

                <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded">
                    <div className="flex items-center gap-3 mb-2">
                        <Bot className="h-5 w-5 text-[#666]" />
                        <span className="font-mono text-[10px] tracking-[0.15em] text-[#777] uppercase">Bot Visits</span>
                    </div>
                    <p className="font-mono text-3xl text-[#666] font-bold">{stats.bot_visits.toLocaleString()}</p>
                </div>
            </div>

            {/* Top Countries */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-5 w-5 text-[#c9a84c]" />
                    <h2 className="font-mono text-sm tracking-[0.2em] text-[#c9a84c] uppercase">Top Countries</h2>
                </div>
                <div className="space-y-4">
                    {stats.top_countries.slice(0, 10).map((country, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <span className="font-mono text-xs text-[#666] w-6">{index + 1}.</span>
                                <span className="font-mono text-sm text-[#c9a84c]">{country.country_code}</span>
                                <span className="font-mono text-xs text-[#999]">{country.country}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-mono text-xs text-[#666]">
                                    {country.unique_ips} unique
                                </span>
                                <span className="font-mono text-sm text-[#c9a84c] w-16 text-right">
                                    {country.visit_count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Cities and Top Pages */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Top Cities */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <MapPin className="h-5 w-5 text-[#c9a84c]" />
                        <h2 className="font-mono text-sm tracking-[0.2em] text-[#c9a84c] uppercase">Top Cities</h2>
                    </div>
                    <div className="space-y-3">
                        {stats.top_cities.slice(0, 8).map((city, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="font-mono text-xs text-[#666] w-6">{index + 1}.</span>
                                    <span className="font-mono text-xs text-[#999] truncate">
                                        {city.city}, {city.country}
                                    </span>
                                </div>
                                <span className="font-mono text-sm text-[#c9a84c] ml-4">{city.visit_count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-[#0a0a0a] border border-[#222] rounded p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="h-5 w-5 text-[#c9a84c]" />
                        <h2 className="font-mono text-sm tracking-[0.2em] text-[#c9a84c] uppercase">Top Pages</h2>
                    </div>
                    <div className="space-y-3">
                        {stats.top_pages.slice(0, 8).map((page, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="font-mono text-xs text-[#666] w-6">{index + 1}.</span>
                                    <span className="font-mono text-xs text-[#999] truncate">{page.path}</span>
                                </div>
                                <span className="font-mono text-sm text-[#c9a84c] ml-4">{page.visit_count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Visits */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded p-6">
                <h2 className="font-mono text-sm tracking-[0.2em] text-[#c9a84c] uppercase mb-6">Recent Visits</h2>
                <div className="space-y-3">
                    {stats.recent_visits.slice(0, 15).map((visit) => (
                        <div key={visit.id} className="flex items-center justify-between text-xs font-mono border-b border-[#1a1a1a] pb-3">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <span className="text-[#999] w-32 truncate">
                                    {visit.city || 'Unknown'}, {visit.country || 'Unknown'}
                                </span>
                                <span className="text-[#666] flex-1 truncate">{visit.path}</span>
                            </div>
                            <span className="text-[#666] ml-4">
                                {new Date(visit.created_at).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
