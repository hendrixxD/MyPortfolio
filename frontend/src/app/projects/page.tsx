import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';
import { getProjects, getProjectCategories } from '@/lib/api';
import { ProjectsBackground } from '@/components/backgrounds/AnimatedBackgrounds';
import type { ProjectBrief } from '@/types';

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Explore my portfolio of data engineering, chemical/petroleum technology, and web development projects.',
    openGraph: {
        title: 'Projects | lengedandungjoshua',
        description: 'Explore my portfolio of data engineering, chemical/petroleum technology, and web development projects.',
    },
};

export const revalidate = 60;

interface ProjectsPageProps {
    searchParams: { page?: string; category?: string; tag?: string };
}

const categoryLabels: Record<string, string> = {
    'data-engineering': 'Data Engineering',
    'chemical-petroleum': 'Chemical / Petroleum',
    'web-app': 'Web Development',
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const page = parseInt(searchParams.page || '1');
    const category = searchParams.category;
    const tag = searchParams.tag;

    const [projectsRes, categories] = await Promise.all([
        getProjects({ page, page_size: 12, category, tag }).catch(() => ({ items: [], total: 0, pages: 1, page: 1, page_size: 12 })),
        getProjectCategories().catch(() => []),
    ]);

    const projects: ProjectBrief[] = projectsRes.items || [];
    const totalPages = projectsRes.pages || 1;

    const buildUrl = (p: number) => {
        const params = new URLSearchParams();
        if (p > 1) params.set('page', String(p));
        if (category) params.set('category', category);
        if (tag) params.set('tag', tag);
        const qs = params.toString();
        return `/projects${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <ProjectsBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">
                        [ PROJECTS ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">
                        Work
                    </h1>
                    <p className="text-[#666] max-w-xl leading-relaxed">
                        Data pipelines, process simulation tools, and web systems — built
                        at the intersection of chemical engineering and software.
                    </p>
                </div>
            </section>

            {/* ── Category filters ── */}
            {categories.length > 0 && (
                <section className="py-5 border-b border-[#1c1c1c]">
                    <div className="container-custom flex flex-wrap gap-3 font-mono text-sm">
                        <Link
                            href="/projects"
                            className={`px-3 py-1 transition-colors ${!category
                                ? 'text-[#c9a84c] border border-[#c9a84c]/40'
                                : 'text-[#555] border border-[#1c1c1c] hover:text-[#e2d9c8] hover:border-[#333]'
                                }`}
                        >
                            {!category ? '[ALL]' : 'ALL'}
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={`/projects?category=${cat}`}
                                className={`px-3 py-1 transition-colors ${category === cat
                                    ? 'text-[#c9a84c] border border-[#c9a84c]/40'
                                    : 'text-[#555] border border-[#1c1c1c] hover:text-[#e2d9c8] hover:border-[#333]'
                                    }`}
                            >
                                {category === cat
                                    ? `[${(categoryLabels[cat] || cat).toUpperCase()}]`
                                    : (categoryLabels[cat] || cat).toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <div className="container-custom py-10">
                {projects.length > 0 ? (
                    <>
                        {/* ── 2-column grid ── */}
                        <div className="grid md:grid-cols-2 gap-px bg-[#1c1c1c] mb-12">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-[#080808] hover:bg-[#111] hover:border-[#c9a84c]/25 border border-transparent transition-colors flex flex-col"
                                >
                                    {/* Cover / art cell */}
                                    <div className="aspect-video bg-[#0f0f0f] overflow-hidden relative border-b border-[#1c1c1c]">
                                        {project.cover_image ? (
                                            <Image
                                                src={project.cover_image}
                                                alt={project.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover opacity-80"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="font-mono text-[#1c1c1c] text-lg font-bold tracking-tighter leading-tight text-center px-6 select-none">
                                                    {project.title.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {/* Featured indicator */}
                                        {project.featured && (
                                            <span className="absolute top-3 left-3 font-mono text-xs text-[#c9a84c]">
                                                ★
                                            </span>
                                        )}
                                        {/* Category badge */}
                                        {project.category && (
                                            <span className="absolute bottom-3 right-3 font-mono text-[10px] text-[#444] tracking-wider">
                                                {(categoryLabels[project.category] || project.category).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="text-[#e2d9c8] font-semibold text-base hover:text-white transition-colors line-clamp-1"
                                            >
                                                {project.title}
                                            </Link>
                                        </div>

                                        {project.summary && (
                                            <p className="text-[#555] text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                                                {project.summary}
                                            </p>
                                        )}

                                        {/* Tech tags — inline code style */}
                                        {project.tech_tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {project.tech_tags.slice(0, 5).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="font-mono text-xs border border-[#2a2a2a] text-[#888] px-1.5 py-0.5"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.tech_tags.length > 5 && (
                                                    <span className="font-mono text-xs border border-[#2a2a2a] text-[#555] px-1.5 py-0.5">
                                                        +{project.tech_tags.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Bottom bar */}
                                        <div className="flex items-center gap-4 pt-3 border-t border-[#1c1c1c]">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="font-mono text-xs text-[#555] hover:text-[#c9a84c] transition-colors"
                                            >
                                                VIEW DETAILS →
                                            </Link>
                                            <div className="flex-1" />
                                            {project.repo_url && (
                                                <a
                                                    href={project.repo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-xs text-[#444] hover:text-[#e2d9c8] transition-colors flex items-center gap-1"
                                                    aria-label="GitHub Repository"
                                                >
                                                    <Github className="h-3.5 w-3.5" />
                                                    REPO
                                                </a>
                                            )}
                                            {project.live_url && (
                                                <a
                                                    href={project.live_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-xs text-[#444] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
                                                    aria-label="Live Demo"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    LIVE
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-6 py-4 font-mono text-sm">
                                {page > 1 ? (
                                    <Link
                                        href={buildUrl(page - 1)}
                                        className="text-[#555] hover:text-[#c9a84c] transition-colors"
                                    >
                                        ← Prev
                                    </Link>
                                ) : (
                                    <span className="text-[#333]">← Prev</span>
                                )}
                                <span className="text-[#444]">
                                    Page {page} of {totalPages}
                                </span>
                                {page < totalPages ? (
                                    <Link
                                        href={buildUrl(page + 1)}
                                        className="text-[#555] hover:text-[#c9a84c] transition-colors"
                                    >
                                        Next →
                                    </Link>
                                ) : (
                                    <span className="text-[#333]">Next →</span>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* ── Empty state ── */
                    <div className="py-20 border-b border-[#1c1c1c]">
                        <p className="font-mono text-xs text-[#444] mb-3">// NO RESULTS</p>
                        <h3 className="text-xl font-semibold text-[#e2d9c8] mb-2">
                            No projects found
                        </h3>
                        <p className="text-[#555] text-sm mb-6">
                            {category
                                ? 'Try selecting a different category.'
                                : 'Check back soon for new projects.'}
                        </p>
                        {category && (
                            <Link
                                href="/projects"
                                className="font-mono text-sm text-[#c9a84c] hover:text-[#e2d9c8] transition-colors"
                            >
                                ← View all projects
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
