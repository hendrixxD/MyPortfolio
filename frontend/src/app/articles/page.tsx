import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, FileText, Eye, Clock, Heart } from 'lucide-react';
import { getArticles, getTags } from '@/lib/api';
import { formatDate, getReadingTime } from '@/lib/utils';
import { ArticlesBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Articles',
    description: 'Technical articles on data engineering, software development, and chemical/petroleum technology by lengedandungjoshua.',
    openGraph: {
        title: 'Articles | lengedandungjoshua',
        description: 'Technical articles on data engineering, software development, and chemical/petroleum technology.',
    },
};

export const revalidate = 60;

interface ArticlesPageProps {
    searchParams: { page?: string; tag?: string; search?: string };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
    const page = parseInt(searchParams.page || '1');
    const tag = searchParams.tag;
    const search = searchParams.search;

    const [articlesRes, tags] = await Promise.all([
        getArticles({ page, page_size: 9, tag, search }).catch(() => ({ items: [], total: 0, pages: 1, page: 1, page_size: 9 })),
        getTags('article').catch(() => []),
    ]);

    const articles = articlesRes.items || [];
    const totalPages = articlesRes.pages || 1;

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <ArticlesBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Articles</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Thoughts, tutorials, and insights on data engineering, software development,
                        and the intersection of technology and science.
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search */}
                        <form className="relative flex-1 max-w-md" action="/articles" method="get">
                            {tag && <input type="hidden" name="tag" value={tag} />}
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search articles..."
                                defaultValue={search}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                            />
                        </form>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/articles"
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!tag
                                        ? 'bg-white text-zinc-900'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                        }`}
                                >
                                    All
                                </Link>
                                {tags.slice(0, 6).map((t) => (
                                    <Link
                                        key={t.id}
                                        href={`/articles?tag=${t.slug}`}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tag === t.slug
                                            ? 'bg-white text-zinc-900'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                            }`}
                                    >
                                        {t.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Articles Grid */}
                    {articles.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/articles/${article.slug}`}
                                        className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                                    >
                                        {/* Thumbnail Image */}
                                        <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                                            {article.cover_image ? (
                                                <>
                                                    <img
                                                        src={article.cover_image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />
                                                </>
                                            ) : (
                                                // Placeholder for articles without images
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                    <FileText className="w-12 h-12 text-zinc-600" />
                                                </div>
                                            )}

                                            {/* Reading time badge */}
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-zinc-900/80 backdrop-blur-sm rounded-lg text-xs text-zinc-300 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getReadingTime(article.reading_time)}
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            {/* Meta info */}
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                                                <time>{formatDate(article.published_at)}</time>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {article.view_count}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-zinc-200 transition-colors">
                                                {article.title}
                                            </h2>

                                            {/* Summary */}
                                            <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
                                                {article.summary}
                                            </p>

                                            {/* Tags */}
                                            {article.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {article.tags.slice(0, 3).map((t) => (
                                                        <span
                                                            key={t.id}
                                                            className="px-2 py-0.5 text-xs rounded-full transition-colors"
                                                            style={{
                                                                backgroundColor: `${t.color}20`,
                                                                color: t.color
                                                            }}
                                                        >
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    {page > 1 && (
                                        <Link
                                            href={`/articles?page=${page - 1}${tag ? `&tag=${tag}` : ''}${search ? `&search=${search}` : ''}`}
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
                                            href={`/articles?page=${page + 1}${tag ? `&tag=${tag}` : ''}${search ? `&search=${search}` : ''}`}
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
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold mb-2 text-white">No articles found</h3>
                            <p className="text-zinc-400 mb-6">
                                {search || tag
                                    ? 'Try adjusting your filters or search query.'
                                    : 'Check back soon for new content!'}
                            </p>
                            {(search || tag) && (
                                <Link
                                    href="/articles"
                                    className="inline-flex px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-medium transition-all duration-300 hover:bg-zinc-700"
                                >
                                    Clear Filters
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
