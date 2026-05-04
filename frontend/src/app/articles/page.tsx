import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles, getTags } from '@/lib/api';
import { formatDate, getReadingTime } from '@/lib/utils';
import { ArticlesBackground } from '@/components/backgrounds/AnimatedBackgrounds';
import type { ArticleBrief } from '@/types';

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
        getArticles({ page, page_size: 10, tag, search }).catch(() => ({ items: [], total: 0, pages: 1, page: 1, page_size: 10 })),
        getTags('article').catch(() => []),
    ]);

    const articles: ArticleBrief[] = articlesRes.items || [];
    const totalPages = articlesRes.pages || 1;

    const featuredArticle = page === 1 && !search && !tag
        ? articles.find((a) => a.featured)
        : undefined;

    const listArticles = featuredArticle
        ? articles.filter((a) => a.id !== featuredArticle.id)
        : articles;

    const buildUrl = (p: number) => {
        const params = new URLSearchParams();
        if (p > 1) params.set('page', String(p));
        if (tag) params.set('tag', tag);
        if (search) params.set('search', search);
        const qs = params.toString();
        return `/articles${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <ArticlesBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">
                        [ WRITING ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">
                        Articles
                    </h1>
                    <p className="text-[#666] max-w-xl leading-relaxed">
                        Thoughts, tutorials, and technical depth on data engineering,
                        pipeline architecture, and the science underneath the stack.
                    </p>
                </div>
            </section>

            {/* ── Filters ── */}
            <section className="py-6 border-b border-[#1c1c1c]">
                <div className="container-custom flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Search — underline style */}
                    <form action="/articles" method="get" className="flex-1 max-w-xs relative">
                        {tag && <input type="hidden" name="tag" value={tag} />}
                        <input
                            type="text"
                            name="search"
                            placeholder="Search articles..."
                            defaultValue={search}
                            className="w-full bg-transparent border-b border-[#333] text-[#e2d9c8] placeholder-[#444] text-sm py-1.5 pr-4 focus:outline-none focus:border-[#c9a84c] transition-colors font-mono"
                        />
                    </form>

                    {/* Tag links — minimal text */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-mono">
                            <Link
                                href="/articles"
                                className={`transition-colors ${!tag
                                    ? 'text-[#c9a84c] border-l-2 border-[#c9a84c] pl-2'
                                    : 'text-[#555] hover:text-[#e2d9c8] pl-2'
                                    }`}
                            >
                                ALL
                            </Link>
                            {tags.slice(0, 8).map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/articles?tag=${t.slug}`}
                                    className={`transition-colors ${tag === t.slug
                                        ? 'text-[#c9a84c] border-l-2 border-[#c9a84c] pl-2'
                                        : 'text-[#555] hover:text-[#e2d9c8] pl-2'
                                        }`}
                                >
                                    {t.name.toUpperCase()}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <div className="container-custom py-0">
                {articles.length > 0 ? (
                    <>
                        {/* ── Featured spotlight ── */}
                        {featuredArticle && (
                            <Link
                                href={`/articles/${featuredArticle.slug}`}
                                className="block border-b border-[#1c1c1c] py-10 hover:bg-[#111] transition-colors group"
                            >
                                <div className="flex gap-8 items-start">
                                    <span className="font-mono text-3xl font-bold text-[#c9a84c] opacity-40 shrink-0 leading-none mt-1">
                                        00
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {featuredArticle.tags?.slice(0, 4).map((t) => (
                                                <span
                                                    key={t.id}
                                                    className="font-mono text-[10px] px-2 py-0.5 tracking-wider"
                                                    style={{
                                                        backgroundColor: t.color + '20',
                                                        color: t.color,
                                                    }}
                                                >
                                                    {t.name.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-[#e2d9c8] mb-3 group-hover:text-white transition-colors">
                                            {featuredArticle.title}
                                        </h2>
                                        {featuredArticle.summary && (
                                            <p className="text-[#666] leading-relaxed mb-4 max-w-2xl">
                                                {featuredArticle.summary}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-6 font-mono text-xs text-[#555]">
                                            {featuredArticle.published_at && (
                                                <time>{formatDate(featuredArticle.published_at, 'medium')}</time>
                                            )}
                                            <span>{getReadingTime(featuredArticle.reading_time)}</span>
                                            <span className="text-[#c9a84c]">★ FEATURED</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* ── Article list ── */}
                        {listArticles.map((article, i) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="flex gap-6 md:gap-8 items-start py-7 border-b border-[#1c1c1c] hover:bg-[#111] transition-colors group"
                            >
                                {/* Counter */}
                                <span className="font-mono text-sm text-[#c9a84c] opacity-50 shrink-0 w-7 text-right mt-0.5">
                                    {String(featuredArticle ? i + 1 : i + 1).padStart(2, '0')}
                                </span>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {article.published_at && (
                                        <time className="font-mono text-[11px] text-[#444] block mb-1.5">
                                            {formatDate(article.published_at, 'medium')}
                                        </time>
                                    )}
                                    <h2 className="text-base md:text-lg font-semibold text-[#e2d9c8] mb-1.5 group-hover:text-white transition-colors line-clamp-1">
                                        {article.title}
                                    </h2>
                                    {article.summary && (
                                        <p className="text-sm text-[#555] line-clamp-2 mb-2.5 leading-relaxed">
                                            {article.summary}
                                        </p>
                                    )}
                                    {article.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {article.tags.slice(0, 3).map((t) => (
                                                <span
                                                    key={t.id}
                                                    className="font-mono text-[10px] px-1.5 py-0.5 tracking-wider"
                                                    style={{
                                                        backgroundColor: t.color + '20',
                                                        color: t.color,
                                                    }}
                                                >
                                                    {t.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Reading time */}
                                <span className="font-mono text-[11px] text-[#444] shrink-0 mt-0.5 hidden sm:block">
                                    {getReadingTime(article.reading_time)}
                                </span>
                            </Link>
                        ))}

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-6 py-12 font-mono text-sm">
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
                            No articles found
                        </h3>
                        <p className="text-[#555] mb-6 text-sm">
                            {search || tag
                                ? 'Adjust your filters or search query.'
                                : 'Check back soon.'}
                        </p>
                        {(search || tag) && (
                            <Link
                                href="/articles"
                                className="font-mono text-sm text-[#c9a84c] hover:text-[#e2d9c8] transition-colors"
                            >
                                ← Clear filters
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
