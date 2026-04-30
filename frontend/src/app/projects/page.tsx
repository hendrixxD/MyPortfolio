import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Github, Code2, Folder, Star } from 'lucide-react';
import { getProjects, getProjectCategories } from '@/lib/api';
import { ProjectsBackground } from '@/components/backgrounds/AnimatedBackgrounds';

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

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const page = parseInt(searchParams.page || '1');
    const category = searchParams.category;
    const tag = searchParams.tag;

    const [projectsRes, categories] = await Promise.all([
        getProjects({ page, page_size: 12, category, tag }).catch(() => ({ items: [], total: 0, pages: 1, page: 1, page_size: 12 })),
        getProjectCategories().catch(() => []),
    ]);

    const projects = projectsRes.items || [];
    const totalPages = projectsRes.pages || 1;

    const categoryLabels: Record<string, string> = {
        'data-engineering': 'Data Engineering',
        'chemical-petroleum': 'Chemical/Petroleum',
        'web-app': 'Web Development',
    };

    const categoryColors: Record<string, string> = {
        'data-engineering': 'from-blue-500/20 to-cyan-500/20',
        'chemical-petroleum': 'from-orange-500/20 to-yellow-500/20',
        'web-app': 'from-purple-500/20 to-pink-500/20',
    };

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <ProjectsBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <Code2 className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Projects</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        A showcase of my work spanning data engineering, chemical/petroleum technology,
                        and web development. Each project represents a unique challenge and solution.
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Category Filters */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            <Link
                                href="/projects"
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${!category
                                    ? 'bg-white text-zinc-900'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                    }`}
                            >
                                All Projects
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/projects?category=${cat}`}
                                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${category === cat
                                        ? 'bg-white text-zinc-900'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                        }`}
                                >
                                    {categoryLabels[cat] || cat}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Projects Grid */}
                    {projects.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 flex flex-col"
                                    >
                                        {/* Thumbnail Image */}
                                        <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                                            {project.cover_image ? (
                                                <>
                                                    <img
                                                        src={project.cover_image}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
                                                </>
                                            ) : (
                                                // Placeholder with category-colored gradient
                                                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${categoryColors[project.category] || 'from-zinc-800 to-zinc-900'}`}>
                                                    <Folder className="w-12 h-12 text-zinc-600" />
                                                </div>
                                            )}

                                            {/* Featured badge */}
                                            {project.featured && (
                                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500/90 backdrop-blur-sm rounded-lg text-xs font-medium text-zinc-900 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Featured
                                                </div>
                                            )}

                                            {/* Category badge */}
                                            {project.category && (
                                                <div className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg text-xs text-zinc-300">
                                                    {categoryLabels[project.category] || project.category}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            {/* Title */}
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="block mb-2"
                                            >
                                                <h2 className="text-xl font-semibold text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                                                    {project.title}
                                                </h2>
                                            </Link>

                                            {/* Summary */}
                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-1">
                                                {project.summary}
                                            </p>

                                            {/* Tech Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {project.tech_tags?.slice(0, 4).map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-zinc-400"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.tech_tags?.length > 4 && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-zinc-800 text-zinc-500">
                                                        +{project.tech_tags.length - 4}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Links */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    View Details →
                                                </Link>
                                                <div className="flex-1" />
                                                {project.repo_url && (
                                                    <a
                                                        href={project.repo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                                                        aria-label="GitHub Repository"
                                                    >
                                                        <Github className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {project.live_url && (
                                                    <a
                                                        href={project.live_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                                                        aria-label="Live Demo"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    {page > 1 && (
                                        <Link
                                            href={`/projects?page=${page - 1}${category ? `&category=${category}` : ''}`}
                                            className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-medium transition-all duration-300 hover:bg-zinc-700"
                                        >
                                            Previous
                                        </Link>
                                    )}

                                    <span className="px-4 py-3 text-zinc-400">
                                        Page {page} of {totalPages}
                                    </span>

                                    {page < totalPages && (
                                        <Link
                                            href={`/projects?page=${page + 1}${category ? `&category=${category}` : ''}`}
                                            className="px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-medium transition-all duration-300 hover:bg-zinc-700"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-xl font-semibold mb-2 text-white">No projects found</h3>
                            <p className="text-zinc-400 mb-6">
                                {category
                                    ? 'Try selecting a different category.'
                                    : 'Check back soon for new projects!'}
                            </p>
                            {category && (
                                <Link
                                    href="/projects"
                                    className="inline-flex px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-medium transition-all duration-300 hover:bg-zinc-700"
                                >
                                    View All Projects
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
