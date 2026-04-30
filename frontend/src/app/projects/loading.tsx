import { ProjectGridSkeleton } from '@/components/ui/Skeletons';

export default function ProjectsLoading() {
    return (
        <div className="min-h-screen relative">
            {/* Hero Section skeleton */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mb-6 animate-pulse" />
                    <div className="h-12 w-48 bg-zinc-800 rounded mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-96 max-w-full bg-zinc-800/60 rounded mx-auto animate-pulse" />
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Header skeleton */}
                    <div className="max-w-3xl mb-12">
                        <div className="h-12 w-48 bg-zinc-800 rounded mb-4 animate-pulse" />
                        <div className="h-6 w-full max-w-xl bg-zinc-800/60 rounded animate-pulse" />
                    </div>

                    {/* Category filters skeleton */}
                    <div className="flex gap-2 mb-8">
                        <div className="h-9 w-24 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-9 w-32 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-9 w-36 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-9 w-28 bg-zinc-800 rounded-full animate-pulse" />
                    </div>

                    {/* Projects Grid skeleton */}
                    <ProjectGridSkeleton count={12} />
                </div>
            </div>
        </div>
    );
}
