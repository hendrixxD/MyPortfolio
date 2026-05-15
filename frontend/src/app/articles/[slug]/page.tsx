import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Eye, ChevronRight, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { getArticle, getArticleSlugs } from '@/lib/api';
import { formatDate, getReadingTime } from '@/lib/utils';
import { ArticleEngagement } from '@/components/ui/ArticleEngagement';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ArticleComments } from '@/components/ui/ArticleComments';
import 'highlight.js/styles/github-dark.css';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        const article = await getArticle(slug);

        return {
            title: article.meta_title || article.title,
            description: article.meta_description || article.summary,
            openGraph: {
                title: article.meta_title || article.title,
                description: article.meta_description || article.summary || '',
                type: 'article',
                publishedTime: article.published_at || undefined,
                authors: ['lengedandungjoshua'],
                images: article.cover_image ? [{ url: article.cover_image }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: article.meta_title || article.title,
                description: article.meta_description || article.summary || '',
                images: article.cover_image ? [article.cover_image] : [],
            },
        };
    } catch {
        return {
            title: 'Article Not Found',
        };
    }
}

export async function generateStaticParams() {
    try {
        const slugs = await getArticleSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

export const revalidate = 60;

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    let article;
    try {
        article = await getArticle(slug);
    } catch {
        notFound();
    }

    // Generate TOC from headings
    const headings = article.content_md.match(/^#{1,3}\s.+$/gm) || [];
    const toc = headings.map((heading) => {
        const level = heading.match(/^#+/)?.[0].length || 1;
        const text = heading.replace(/^#+\s/, '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return { level, text, id };
    });

    return (
        <>
            {/* Reading Progress Bar */}
            <ReadingProgressBar />

            <article className="section-padding">
                <div className="container-custom">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                        <Link href="/" className="hover:text-zinc-200 transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/articles" className="hover:text-zinc-200 transition-colors">
                            Articles
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-zinc-100 truncate max-w-[200px]">
                            {article.title}
                        </span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Main Content */}
                        <div className="flex-1 max-w-3xl">
                            {/* Header */}
                            <header className="mb-8">
                                {article.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {article.tags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={`/articles?tag=${tag.slug}`}
                                                className="px-3 py-1 text-sm rounded-full transition-all hover:scale-105"
                                                style={{
                                                    backgroundColor: `${tag.color}20`,
                                                    color: tag.color
                                                }}
                                            >
                                                {tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
                                    {article.title}
                                </h1>

                                {article.summary && (
                                    <p className="text-xl text-zinc-400 mb-6">
                                        {article.summary}
                                    </p>
                                )}

                                {/* Author & Meta Section - X/Substack style */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-800/50">
                                    {/* Author Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                <User className="w-5 h-5 text-zinc-900" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-zinc-800">
                                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">Lenge Dandung Joshua</p>
                                            <p className="text-xs text-zinc-500">Data Engineer & Chemical/Petroleum Tech</p>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <time>{formatDate(article.published_at, 'MMM d, yyyy')}</time>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span>{getReadingTime(article.reading_time)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="h-4 w-4" />
                                            <span>{article.view_count} views</span>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Cover Image with thumbnail preview - Back inside container */}
                            {article.cover_image && (
                                <div className="aspect-video rounded-xl overflow-hidden mb-10 bg-zinc-800 relative group shadow-2xl shadow-black/30">
                                    <Image
                                        src={article.cover_image}
                                        alt={article.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 800px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        priority
                                    />
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}

                            {/* Article Body - Premium typography */}
                            <div className="prose-article">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight, rehypeSlug]}
                                    components={{
                                        // Custom image component for markdown images
                                        img: ({ node, ...props }) => (
                                            <span className="block my-10">
                                                <img
                                                    {...props}
                                                    className="rounded-2xl w-full shadow-xl shadow-black/30"
                                                    loading="lazy"
                                                />
                                            </span>
                                        ),
                                        // Custom heading styles - Substack inspired
                                        h2: ({ node, ...props }) => (
                                            <h2 {...props} className="text-2xl md:text-3xl font-bold mt-14 mb-5 text-white tracking-tight" />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3 {...props} className="text-xl md:text-2xl font-bold mt-10 mb-4 text-white tracking-tight" />
                                        ),
                                        h4: ({ node, ...props }) => (
                                            <h4 {...props} className="text-lg md:text-xl font-semibold mt-8 mb-3 text-white" />
                                        ),
                                        // Custom paragraph - Optimized for reading
                                        p: ({ node, ...props }) => (
                                            <p {...props} className="text-zinc-300 text-lg leading-[1.8] mb-6 font-normal" />
                                        ),
                                        // Custom code blocks
                                        pre: ({ node, ...props }) => (
                                            <pre {...props} className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 overflow-x-auto my-8 shadow-lg" />
                                        ),
                                        // Custom inline code
                                        code: ({ node, inline, ...props }: any) => (
                                            inline
                                                ? <code {...props} className="bg-zinc-800/80 px-2 py-1 rounded-md text-sm text-amber-300/90 font-mono" />
                                                : <code {...props} />
                                        ),
                                        // Custom links
                                        a: ({ node, ...props }) => (
                                            <a {...props} className="text-amber-400 underline underline-offset-4 decoration-amber-400/30 hover:decoration-amber-400 hover:text-amber-300 transition-colors" />
                                        ),
                                        // Custom lists
                                        ul: ({ node, ...props }) => (
                                            <ul {...props} className="list-disc list-outside pl-6 space-y-3 text-zinc-300 text-lg mb-6 marker:text-amber-500/60" />
                                        ),
                                        ol: ({ node, ...props }) => (
                                            <ol {...props} className="list-decimal list-outside pl-6 space-y-3 text-zinc-300 text-lg mb-6 marker:text-amber-500/60" />
                                        ),
                                        li: ({ node, ...props }) => (
                                            <li {...props} className="leading-relaxed pl-1" />
                                        ),
                                        // Custom blockquote - Substack style
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote {...props} className="relative border-l-[3px] border-amber-500/60 pl-6 py-2 my-8 text-xl text-zinc-400 italic font-light" />
                                        ),
                                        // Horizontal rule
                                        hr: ({ node, ...props }) => (
                                            <hr {...props} className="my-12 border-t border-zinc-800/60" />
                                        ),
                                        // Strong text
                                        strong: ({ node, ...props }) => (
                                            <strong {...props} className="font-semibold text-white" />
                                        ),
                                        // Emphasis text
                                        em: ({ node, ...props }) => (
                                            <em {...props} className="italic text-zinc-200" />
                                        ),
                                    }}
                                >
                                    {article.content_md}
                                </ReactMarkdown>
                            </div>

                            {/* Divider */}
                            <div className="my-12 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                            </div>

                            {/* Engagement Section - Enhanced */}
                            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 mb-8">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-zinc-500 mb-1">Enjoyed this article?</p>
                                        <p className="text-zinc-300">Show some love and share it with others</p>
                                    </div>
                                    <ArticleEngagement
                                        title={article.title}
                                        summary={article.summary || undefined}
                                        articleId={article.id}
                                        initialLikes={0}
                                    />
                                </div>
                            </div>

                            {/* Comments Section */}
                            <ArticleComments articleId={article.id} articleTitle={article.title} />

                            {/* Footer Navigation */}
                            <footer className="mt-12 pt-8 border-t border-zinc-800/50">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <Link
                                        href="/articles"
                                        className="group inline-flex items-center gap-3 px-6 py-3 bg-zinc-800/80 text-zinc-100 rounded-xl font-medium transition-all duration-300 hover:bg-zinc-700 hover:-translate-y-0.5 hover:shadow-lg"
                                    >
                                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                        Back to Articles
                                    </Link>

                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                        <span>Published on</span>
                                        <span className="text-zinc-400">{formatDate(article.published_at, 'MMMM d, yyyy')}</span>
                                    </div>
                                </div>
                            </footer>
                        </div>

                        {/* Sidebar - TOC (Sticky) */}
                        {toc.length > 2 && (
                            <aside className="hidden lg:block w-64 flex-shrink-0">
                                <div className="sticky top-24">
                                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600" />
                                            <h3 className="font-semibold text-white">
                                                In this article
                                            </h3>
                                        </div>
                                        <nav className="space-y-1">
                                            {toc.map((item, index) => (
                                                <a
                                                    key={index}
                                                    href={`#${item.id}`}
                                                    className={`block py-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors border-l-2 border-transparent hover:border-amber-400/50 ${item.level === 1 ? 'pl-3' : item.level === 2 ? 'pl-6' : 'pl-9'
                                                        }`}
                                                >
                                                    {item.text}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-4 p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/30">
                                        <h4 className="text-sm font-medium text-zinc-500 mb-3">Quick Stats</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between text-zinc-400">
                                                <span>Reading time</span>
                                                <span className="text-amber-400">{getReadingTime(article.reading_time)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-zinc-400">
                                                <span>Views</span>
                                                <span className="text-amber-400">{article.view_count}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-zinc-400">
                                                <span>Sections</span>
                                                <span className="text-amber-400">{toc.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </article>
        </>
    );
}
