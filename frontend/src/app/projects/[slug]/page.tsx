import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Github, ExternalLink, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getProject, getProjectSlugs } from '@/lib/api';
import 'highlight.js/styles/github-dark.css';

interface ProjectPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        const project = await getProject(slug);

        return {
            title: project.meta_title || project.title,
            description: project.meta_description || project.summary,
            openGraph: {
                title: project.meta_title || project.title,
                description: project.meta_description || project.summary || '',
                type: 'article',
                images: project.cover_image ? [{ url: project.cover_image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: project.meta_title || project.title,
                description: project.meta_description || project.summary || '',
                images: project.cover_image ? [project.cover_image] : [],
            },
        };
    } catch {
        return {
            title: 'Project Not Found',
        };
    }
}

export async function generateStaticParams() {
    try {
        const slugs = await getProjectSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

export const revalidate = 60;

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { slug } = await params;
    let project;
    try {
        project = await getProject(slug);
    } catch {
        notFound();
    }

    const categoryLabels: Record<string, string> = {
        'data-engineering': 'Data Engineering',
        'chemical-petroleum': 'Chemical/Petroleum',
        'web-app': 'Web Development',
    };

    return (
        <article className="section-padding">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
                    <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/projects" className="hover:text-slate-700 dark:hover:text-slate-200">
                        Projects
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {project.title}
                    </span>
                </nav>

                <div className="max-w-4xl">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {project.category && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {categoryLabels[project.category] || project.category}
                                </span>
                            )}
                            {project.featured && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                    Featured
                                </span>
                            )}
                            {project.tags?.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="px-3 py-1 text-sm rounded-full"
                                    style={{
                                        backgroundColor: `${tag.color}20`,
                                        color: tag.color
                                    }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            {project.title}
                        </h1>

                        {project.summary && (
                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                                {project.summary}
                            </p>
                        )}

                        {/* Tech Stack */}
                        {project.tech_tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.tech_tags.map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Links */}
                        <div className="flex flex-wrap gap-3">
                            {project.repo_url && (
                                <a
                                    href={project.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                >
                                    <Github className="mr-2 h-4 w-4" />
                                    View Source
                                </a>
                            )}
                            {project.live_url && (
                                <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Live Demo
                                </a>
                            )}
                        </div>
                    </header>

                    {/* Cover Image */}
                    {project.cover_image && (
                        <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800 relative">
                            <Image
                                src={project.cover_image}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Screenshots */}
                    {project.screenshots?.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {project.screenshots.map((screenshot, index) => (
                                <div
                                    key={index}
                                    className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative"
                                >
                                    <Image
                                        src={screenshot}
                                        alt={`${project.title} screenshot ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {project.description_md && (
                        <div className="prose-custom mb-12">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {project.description_md}
                            </ReactMarkdown>
                        </div>
                    )}

                    {/* Footer */}
                    <footer className="pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Link
                            href="/projects"
                            className="btn-secondary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Link>
                    </footer>
                </div>
            </div>
        </article>
    );
}
