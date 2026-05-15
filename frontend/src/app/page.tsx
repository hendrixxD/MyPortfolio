import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Twitter, Image as ImageIcon } from 'lucide-react';
import {
    getFeaturedArticles,
    getRecentArticles,
    getFeaturedProjects,
    getRecentProjects,
    getProfileLinks,
    getRecentGalleryItems,
    getRecentPublications
} from '@/lib/api';
import { formatDate, getReadingTime } from '@/lib/utils';
import { TimeBasedGreeting } from '@/components/ui/TimeBasedGreeting';
import { HomeBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const revalidate = 60;

async function getHomeData() {
    try {
        const [featuredArticlesRes, recentArticlesRes, featuredProjectsRes, recentProjectsRes, profileLinks, galleryItems, publications] = await Promise.all([
            getFeaturedArticles().catch(() => ({ items: [] })),
            getRecentArticles().catch(() => ({ items: [] })),
            getFeaturedProjects().catch(() => ({ items: [] })),
            getRecentProjects().catch(() => ({ items: [] })),
            getProfileLinks().catch(() => []),
            getRecentGalleryItems().catch(() => []),
            getRecentPublications().catch(() => []),
        ]);

        // Use featured if available, otherwise fall back to recent
        const articles = (featuredArticlesRes.items?.length > 0 ? featuredArticlesRes.items : recentArticlesRes.items) || [];
        const projects = (featuredProjectsRes.items?.length > 0 ? featuredProjectsRes.items : recentProjectsRes.items) || [];

        return {
            articles,
            projects,
            isFeaturedArticles: featuredArticlesRes.items?.length > 0,
            isFeaturedProjects: featuredProjectsRes.items?.length > 0,
            profileLinks: profileLinks || [],
            galleryItems: galleryItems || [],
            publications: publications || [],
        };
    } catch (error) {
        console.error('Error fetching home data:', error);
        return {
            articles: [],
            projects: [],
            isFeaturedArticles: false,
            isFeaturedProjects: false,
            profileLinks: [],
            galleryItems: [],
            publications: []
        };
    }
}

export default async function HomePage() {
    const { articles, projects, isFeaturedArticles, isFeaturedProjects, galleryItems, publications } = await getHomeData();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <HomeBackground />

            {/* ── Hero ── */}
            <section className="pt-8 pb-12 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <div className="flex items-center gap-3 font-mono text-xs mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="text-[#555] tracking-[0.15em]">AVAILABLE FOR OPPORTUNITIES</span>
                    </div>

                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">
                        [ PROFILE ]
                    </p>

                    <h1 className="text-4xl md:text-6xl font-bold text-[#e2d9c8] leading-tight mb-4">
                        <TimeBasedGreeting name="lengedandungjoshua" className="block" />
                    </h1>

                    <p className="text-[#666] max-w-xl leading-relaxed mb-8">
                        <span className="text-[#e2d9c8]">Data Engineer</span> &{' '}
                        <span className="text-[#e2d9c8]">Chemical/Petroleum Technology</span> professional.
                        Building scalable data pipelines at the intersection of technology and science.
                    </p>

                    <div className="flex flex-wrap items-center gap-8 font-mono text-sm mb-10">
                        <Link href="/projects" className="text-[#e2d9c8] hover:text-[#c9a84c] transition-colors">
                            VIEW WORK →
                        </Link>
                        <Link href="/contact" className="text-[#555] hover:text-[#e2d9c8] transition-colors">
                            GET IN TOUCH →
                        </Link>
                        <Link href="/resume" className="text-[#555] hover:text-[#e2d9c8] transition-colors">
                            RESUME →
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="https://github.com/hendrixxD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-[#1c1c1c] text-[#444] hover:text-[#e2d9c8] hover:border-[#333] transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="h-4 w-4" />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/lenge-dandung-joshua/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-[#1c1c1c] text-[#444] hover:text-[#3d7ab5] hover:border-[#333] transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="h-4 w-4" />
                        </a>
                        <a
                            href="https://x.com/hendrixxjdl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-[#1c1c1c] text-[#444] hover:text-[#e2d9c8] hover:border-[#333] transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </section>

            <div className="container-custom">

                {/* ── 01 — Disciplines ── */}
                <section className="py-12 border-b border-[#1c1c1c]">
                    <div className="flex items-baseline gap-4 mb-8">
                        <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                            01 — DISCIPLINES
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-px bg-[#1c1c1c]">
                        <div className="bg-[#080808] p-6">
                            <p className="font-mono text-[11px] tracking-[0.15em] text-[#c9a84c] mb-3">DATA ENGINEERING</p>
                            <p className="text-sm text-[#555] leading-relaxed">
                                Robust ETL pipelines, data warehouses, and real-time processing systems using modern tooling and best practices.
                            </p>
                        </div>
                        <div className="bg-[#080808] p-6">
                            <p className="font-mono text-[11px] tracking-[0.15em] text-[#c9a84c] mb-3">CHEMICAL / PETROLEUM</p>
                            <p className="text-sm text-[#555] leading-relaxed">
                                Laboratory analysis, quality control, and process optimization in the petroleum industry.
                            </p>
                        </div>
                        <div className="bg-[#080808] p-6">
                            <p className="font-mono text-[11px] tracking-[0.15em] text-[#c9a84c] mb-3">TECHNICAL WRITING</p>
                            <p className="text-sm text-[#555] leading-relaxed">
                                Sharing knowledge through articles and documentation on data engineering and software development.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 02 — Featured/Recent Work ── */}
                <section className="py-12 border-b border-[#1c1c1c]">
                    <div className="flex items-baseline justify-between mb-8">
                        <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                            02 — {isFeaturedProjects ? 'FEATURED' : 'RECENT'} WORK
                        </h2>
                        <Link href="/projects" className="font-mono text-xs text-[#555] hover:text-[#c9a84c] transition-colors">
                            ALL PROJECTS →
                        </Link>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-px bg-[#1c1c1c]">
                            {projects.slice(0, 4).map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.slug}`}
                                    className="bg-[#080808] hover:bg-[#111] transition-colors p-6 flex flex-col gap-3 group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-[#e2d9c8] group-hover:text-white transition-colors">
                                            {project.title}
                                        </h3>
                                        {project.featured && (
                                            <span className="font-mono text-xs text-[#c9a84c] shrink-0">★</span>
                                        )}
                                    </div>
                                    {project.summary && (
                                        <p className="text-sm text-[#555] line-clamp-2 leading-relaxed flex-1">
                                            {project.summary}
                                        </p>
                                    )}
                                    {project.tech_tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {project.tech_tags.slice(0, 4).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="font-mono text-xs border border-[#2a2a2a] text-[#555] px-1.5 py-0.5"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 border-b border-[#1c1c1c]">
                            <p className="font-mono text-xs text-[#444]">// COMING SOON</p>
                        </div>
                    )}
                </section>

                {/* ── 03 — Writing ── */}
                <section className="py-12 border-b border-[#1c1c1c]">
                    <div className="flex items-baseline justify-between mb-8">
                        <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                            03 — {isFeaturedArticles ? 'FEATURED' : 'RECENT'} WRITING
                        </h2>
                        <Link href="/articles" className="font-mono text-xs text-[#555] hover:text-[#c9a84c] transition-colors">
                            ALL ARTICLES →
                        </Link>
                    </div>

                    {articles.length > 0 ? (
                        <div>
                            {articles.map((article, i) => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="flex gap-6 md:gap-8 items-start py-6 border-b border-[#1c1c1c] hover:bg-[#111] transition-colors group"
                                >
                                    <span className="font-mono text-sm text-[#c9a84c] opacity-50 shrink-0 w-7 text-right mt-0.5">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        {article.published_at && (
                                            <time className="font-mono text-[11px] text-[#444] block mb-1.5">
                                                {formatDate(article.published_at, 'medium')}
                                            </time>
                                        )}
                                        <h3 className="text-base font-semibold text-[#e2d9c8] mb-1 group-hover:text-white transition-colors line-clamp-1">
                                            {article.title}
                                        </h3>
                                        {article.summary && (
                                            <p className="text-sm text-[#555] line-clamp-1 leading-relaxed">
                                                {article.summary}
                                            </p>
                                        )}
                                    </div>
                                    <span className="font-mono text-[11px] text-[#444] shrink-0 mt-0.5 hidden sm:block">
                                        {getReadingTime(article.reading_time)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="font-mono text-xs text-[#444]">// COMING SOON</p>
                    )}
                </section>

                {/* ── 04 — Gallery ── */}
                {galleryItems.length > 0 && (
                    <section className="py-12 border-b border-[#1c1c1c]">
                        <div className="flex items-baseline justify-between mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                04 — RECENT GALLERY
                            </h2>
                            <Link href="/gallery" className="font-mono text-xs text-[#555] hover:text-[#c9a84c] transition-colors">
                                VIEW ALL →
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1c1c1c]">
                            {galleryItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href="/gallery"
                                    className="bg-[#080808] aspect-square overflow-hidden group relative"
                                >
                                    <Image
                                        src={`${API_URL}${item.url}`}
                                        alt={item.caption || 'Gallery image'}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        priority
                                    />
                                    {item.caption && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <p className="font-mono text-[10px] text-[#e2d9c8] line-clamp-2">{item.caption}</p>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 05 — Publications ── */}
                {publications.length > 0 && (
                    <section className="py-12 border-b border-[#1c1c1c]">
                        <div className="flex items-baseline justify-between mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                {galleryItems.length > 0 ? '05' : '04'} — RECENT PUBLICATIONS
                            </h2>
                            <Link href="/resume" className="font-mono text-xs text-[#555] hover:text-[#c9a84c] transition-colors">
                                VIEW ALL →
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-2 gap-px bg-[#1c1c1c]">
                            {publications.map((pub) => (
                                <div
                                    key={pub.id}
                                    className="bg-[#080808] p-6 flex flex-col gap-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-[#e2d9c8] line-clamp-2">
                                            {pub.title}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-[#555]">
                                        {pub.authors && (
                                            <span className="font-mono">{pub.authors}</span>
                                        )}
                                        {pub.year && (
                                            <span className="font-mono text-[#444]">
                                                · {pub.year}
                                            </span>
                                        )}
                                    </div>
                                    {pub.venue && (
                                        <p className="text-sm text-[#555] italic">{pub.venue}</p>
                                    )}
                                    {pub.url && (
                                        <a
                                            href={pub.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-xs text-[#c9a84c] hover:text-[#d4b56a] transition-colors"
                                        >
                                            READ PAPER →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 06 — Collaborate ── */}
                <section className="py-16">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                        {galleryItems.length > 0 && publications.length > 0 ? '06' : galleryItems.length > 0 || publications.length > 0 ? '05' : '04'} — COLLABORATE
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#e2d9c8] mb-4">
                        Let&apos;s build something.
                    </h2>
                    <p className="text-[#555] mb-8 max-w-xl leading-relaxed">
                        Open to new projects, creative ideas, or opportunities to be part of your vision.
                    </p>
                    <Link
                        href="/contact"
                        className="font-mono text-sm text-[#e2d9c8] hover:text-[#c9a84c] transition-colors"
                    >
                        SEND A MESSAGE →
                    </Link>
                </section>

            </div>
        </div>
    );
}
