'use client';

// Skeleton loader for article cards in grid
export function ArticleCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent skeleton-shimmer" />
            </div>

            <div className="p-6">
                {/* Date and reading time */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-20 bg-zinc-800 rounded" />
                    <div className="h-4 w-4 bg-zinc-800 rounded-full" />
                    <div className="h-4 w-16 bg-zinc-800 rounded" />
                </div>

                {/* Title */}
                <div className="h-6 w-full bg-zinc-800 rounded mb-2" />
                <div className="h-6 w-3/4 bg-zinc-800 rounded mb-4" />

                {/* Summary */}
                <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-zinc-800 rounded" />
                    <div className="h-4 w-5/6 bg-zinc-800 rounded" />
                    <div className="h-4 w-4/6 bg-zinc-800 rounded" />
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                    <div className="h-6 w-16 bg-zinc-800 rounded-full" />
                    <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                    <div className="h-6 w-14 bg-zinc-800 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Full article page skeleton
export function ArticlePageSkeleton() {
    return (
        <article className="section-padding animate-pulse">
            <div className="container-custom">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="h-4 w-12 bg-zinc-800 rounded" />
                    <div className="h-4 w-4 bg-zinc-800 rounded" />
                    <div className="h-4 w-16 bg-zinc-800 rounded" />
                    <div className="h-4 w-4 bg-zinc-800 rounded" />
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        {/* Header */}
                        <header className="mb-8">
                            {/* Tags */}
                            <div className="flex gap-2 mb-4">
                                <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                                <div className="h-6 w-24 bg-zinc-800 rounded-full" />
                            </div>

                            {/* Title */}
                            <div className="h-12 w-full bg-zinc-800 rounded mb-2" />
                            <div className="h-12 w-4/5 bg-zinc-800 rounded mb-4" />

                            {/* Summary */}
                            <div className="h-6 w-full bg-zinc-800/60 rounded mb-2" />
                            <div className="h-6 w-3/4 bg-zinc-800/60 rounded mb-6" />

                            {/* Meta */}
                            <div className="flex items-center gap-4">
                                <div className="h-5 w-28 bg-zinc-800 rounded" />
                                <div className="h-5 w-20 bg-zinc-800 rounded" />
                                <div className="h-5 w-24 bg-zinc-800 rounded" />
                            </div>
                        </header>

                        {/* Cover Image */}
                        <div className="aspect-video rounded-xl bg-zinc-800 mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent skeleton-shimmer" />
                        </div>

                        {/* Content skeleton */}
                        <div className="space-y-6">
                            {/* Paragraph 1 */}
                            <div className="space-y-2">
                                <div className="h-5 w-full bg-zinc-800/80 rounded" />
                                <div className="h-5 w-full bg-zinc-800/80 rounded" />
                                <div className="h-5 w-4/5 bg-zinc-800/80 rounded" />
                            </div>

                            {/* Heading */}
                            <div className="h-8 w-1/2 bg-zinc-800 rounded mt-8" />

                            {/* Paragraph 2 */}
                            <div className="space-y-2">
                                <div className="h-5 w-full bg-zinc-800/80 rounded" />
                                <div className="h-5 w-5/6 bg-zinc-800/80 rounded" />
                                <div className="h-5 w-full bg-zinc-800/80 rounded" />
                                <div className="h-5 w-3/4 bg-zinc-800/80 rounded" />
                            </div>

                            {/* Code block skeleton */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                                    <div className="h-4 w-1/2 bg-zinc-800 rounded" />
                                    <div className="h-4 w-5/6 bg-zinc-800 rounded" />
                                    <div className="h-4 w-2/3 bg-zinc-800 rounded" />
                                </div>
                            </div>

                            {/* Paragraph 3 */}
                            <div className="space-y-2">
                                <div className="h-5 w-full bg-zinc-800/80 rounded" />
                                <div className="h-5 w-4/5 bg-zinc-800/80 rounded" />
                            </div>
                        </div>

                        {/* Engagement skeleton */}
                        <div className="mt-8 pt-8 border-t border-zinc-800">
                            <div className="flex items-center gap-4">
                                <div className="h-11 w-24 bg-zinc-800 rounded-xl" />
                                <div className="h-11 w-24 bg-zinc-800 rounded-xl" />
                                <div className="h-11 w-24 bg-zinc-800 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar TOC skeleton */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="h-6 w-40 bg-zinc-800 rounded mb-4" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-zinc-800/60 rounded" />
                                <div className="h-4 w-5/6 bg-zinc-800/60 rounded pl-4" />
                                <div className="h-4 w-4/5 bg-zinc-800/60 rounded" />
                                <div className="h-4 w-full bg-zinc-800/60 rounded" />
                                <div className="h-4 w-3/4 bg-zinc-800/60 rounded pl-4" />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Add shimmer animation styles */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .skeleton-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </article>
    );
}

// Project card skeleton
export function ProjectCardSkeleton() {
    return (
        <div className="card overflow-hidden animate-pulse flex flex-col">
            {/* Image skeleton */}
            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent skeleton-shimmer" />
            </div>

            <div className="p-6 flex flex-col flex-1">
                {/* Category & Featured */}
                <div className="flex items-start justify-between mb-3">
                    <div className="h-5 w-24 bg-zinc-800 rounded-full" />
                </div>

                {/* Title */}
                <div className="h-6 w-full bg-zinc-800 rounded mb-2" />

                {/* Summary */}
                <div className="space-y-2 mb-4 flex-1">
                    <div className="h-4 w-full bg-zinc-800 rounded" />
                    <div className="h-4 w-4/5 bg-zinc-800 rounded" />
                </div>

                {/* Tech tags */}
                <div className="flex gap-2 mb-4">
                    <div className="h-5 w-14 bg-zinc-800 rounded" />
                    <div className="h-5 w-16 bg-zinc-800 rounded" />
                    <div className="h-5 w-12 bg-zinc-800 rounded" />
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                    <div className="h-4 w-24 bg-zinc-800 rounded" />
                    <div className="h-6 w-6 bg-zinc-800 rounded" />
                    <div className="h-6 w-6 bg-zinc-800 rounded" />
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .skeleton-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
}

// Grid of skeleton loaders
export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    );
}
