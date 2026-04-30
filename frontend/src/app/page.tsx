import Link from 'next/link';
import { ArrowRight, Code2, Database, FlaskConical, BookOpen, Github, Linkedin, Twitter } from 'lucide-react';
import { getFeaturedArticles, getFeaturedProjects, getProfileLinks } from '@/lib/api';
import { formatDate, getReadingTime } from '@/lib/utils';
import { TimeBasedGreeting } from '@/components/ui/TimeBasedGreeting';
import { HomeBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomeData() {
    try {
        const [articlesRes, projectsRes, profileLinks] = await Promise.all([
            getFeaturedArticles().catch(() => ({ items: [] })),
            getFeaturedProjects().catch(() => ({ items: [] })),
            getProfileLinks().catch(() => []),
        ]);

        return {
            articles: articlesRes.items || [],
            projects: projectsRes.items || [],
            profileLinks: profileLinks || [],
        };
    } catch (error) {
        console.error('Error fetching home data:', error);
        return { articles: [], projects: [], profileLinks: [] };
    }
}

export default async function HomePage() {
    const { articles, projects, profileLinks } = await getHomeData();

    return (
        <div className="relative min-h-screen">
            {/* Animated Background */}
            <HomeBackground />

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32 min-h-screen flex items-center">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800/80 backdrop-blur-sm text-zinc-300 text-sm font-medium mb-6 border border-zinc-700">
                            <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Available for opportunities
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                            <TimeBasedGreeting name="lengedandungjoshua" className="block" />
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-400 mb-8 leading-relaxed">
                            <span className="font-semibold text-zinc-200">Data Engineer</span> &
                            <span className="font-semibold text-zinc-200"> Chemical/Petroleum Technology</span> professional.
                            Building scalable data pipelines and exploring the intersection of technology and science.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link href="/projects" className="btn-primary px-8 py-3 text-base">
                                View My Work
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link href="/contact" className="btn-outline px-8 py-3 text-base">
                                Get in Touch
                            </Link>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-center gap-4">
                            <a
                                href="https://github.com/hendrixxD"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-zinc-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600"
                                aria-label="GitHub"
                            >
                                <Github className="h-6 w-6" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/lenge-dandung-joshua/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-zinc-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-zinc-400 hover:text-blue-400 border border-zinc-700 hover:border-zinc-600"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-6 w-6" />
                            </a>
                            <a
                                href="https://x.com/hendrixxjdl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-xl bg-zinc-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* What I Do Section */}
            <section className="section-padding relative">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"></div>
                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">What I Do</h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Bridging the gap between data engineering and scientific research
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card p-8 text-center bg-zinc-800/50 backdrop-blur-sm border-zinc-700 hover:border-zinc-600 transition-all">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-900/30 text-blue-400 mb-6">
                                <Database className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-zinc-200">Data Engineering</h3>
                            <p className="text-zinc-400">
                                Building robust ETL pipelines, data warehouses, and real-time processing systems using modern tools and best practices.
                            </p>
                        </div>

                        <div className="card p-8 text-center bg-zinc-800/50 backdrop-blur-sm border-zinc-700 hover:border-zinc-600 transition-all">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-900/30 text-purple-400 mb-6">
                                <FlaskConical className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-zinc-200">Chemical/Petroleum Tech</h3>
                            <p className="text-zinc-400">
                                Applying scientific methodology to laboratory analysis, quality control, and process optimization in the petroleum industry.
                            </p>
                        </div>

                        <div className="card p-8 text-center bg-zinc-800/50 backdrop-blur-sm border-zinc-700 hover:border-zinc-600 transition-all">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-900/30 text-emerald-400 mb-6">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-zinc-200">Technical Writing</h3>
                            <p className="text-zinc-400">
                                Sharing knowledge through detailed articles, documentation, and tutorials on data engineering and software development.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="section-padding relative">
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"></div>
                <div className="container-custom relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-zinc-100">Featured Projects</h2>
                            <p className="text-zinc-400">
                                Some of my recent work and personal projects
                            </p>
                        </div>
                        <Link href="/projects" className="btn-ghost hidden md:inline-flex text-zinc-300 hover:text-white">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.slug}`}
                                    className="card p-6 group bg-zinc-800/50 backdrop-blur-sm border-zinc-700 hover:border-zinc-600 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800">
                                            <Code2 className="h-6 w-6 text-zinc-300" />
                                        </div>
                                        {project.featured && (
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-900/30 text-primary-300 border border-primary-800/50">
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2 text-zinc-200 group-hover:text-white transition-colors">
                                        {project.title}
                                    </h3>

                                    <p className="text-zinc-400 mb-4 line-clamp-2">
                                        {project.summary}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_tags?.slice(0, 4).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-700/50 text-zinc-300 border border-zinc-600/50"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p>Projects coming soon...</p>
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/projects" className="btn-secondary">
                            View All Projects
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            <section className="section-padding relative">
                <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"></div>
                <div className="container-custom relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-zinc-100">Latest Articles</h2>
                            <p className="text-zinc-400">
                                Thoughts on data engineering, technology, and more
                            </p>
                        </div>
                        <Link href="/articles" className="btn-ghost hidden md:inline-flex text-zinc-300 hover:text-white">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>

                    {articles.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="card overflow-hidden group bg-zinc-800/50 backdrop-blur-sm border-zinc-700 hover:border-zinc-600 transition-all"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                                            <time>{formatDate(article.published_at)}</time>
                                            <span>•</span>
                                            <span>{getReadingTime(article.reading_time)}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2 text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        <p className="text-zinc-400 text-sm line-clamp-3">
                                            {article.summary}
                                        </p>

                                        {article.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-4">
                                                {article.tags.slice(0, 2).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-0.5 text-xs rounded-full"
                                                        style={{
                                                            backgroundColor: `${tag.color}20`,
                                                            color: tag.color
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p>Articles coming soon...</p>
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/articles" className="btn-secondary">
                            View All Articles
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-zinc-800/60 to-zinc-900/80 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/10 to-transparent"></div>
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">
                        Let's Work Together
                    </h2>
                    <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-8 py-3 bg-zinc-100 text-zinc-900 font-semibold rounded-lg hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                    >
                        Get in Touch
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

