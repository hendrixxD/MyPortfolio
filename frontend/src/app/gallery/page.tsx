'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, Grid3X3, LayoutGrid } from 'lucide-react';
import { GalleryBackground } from '@/components/backgrounds/AnimatedBackgrounds';

const galleryCategories = [
    { id: 'all', name: 'ALL' },
    { id: 'work', name: 'WORK' },
    { id: 'events', name: 'EVENTS' },
    { id: 'personal', name: 'PERSONAL' },
    { id: 'achievements', name: 'ACHIEVEMENTS' },
];

const galleryImages = [
    {
        id: 1,
        src: '/gallery/placeholder-1.jpg',
        alt: 'Data Engineering Workshop',
        title: 'Data Engineering Workshop',
        category: 'work',
        description: 'Leading a workshop on modern data pipeline architecture',
        date: '2025-12-15',
    },
    {
        id: 2,
        src: '/gallery/placeholder-2.jpg',
        alt: 'Tech Conference 2025',
        title: 'Tech Conference 2025',
        category: 'events',
        description: 'Speaking at the annual tech conference about data engineering trends',
        date: '2025-11-20',
    },
    {
        id: 3,
        src: '/gallery/placeholder-3.jpg',
        alt: 'Team Collaboration',
        title: 'Team Collaboration',
        category: 'work',
        description: 'Collaborative session with the data team',
        date: '2025-10-05',
    },
    {
        id: 4,
        src: '/gallery/placeholder-4.jpg',
        alt: 'Award Ceremony',
        title: 'Excellence Award',
        category: 'achievements',
        description: 'Receiving the excellence award for innovation in data systems',
        date: '2025-09-18',
    },
    {
        id: 5,
        src: '/gallery/placeholder-5.jpg',
        alt: 'Laboratory Analysis',
        title: 'Petroleum Lab',
        category: 'work',
        description: 'Quality control analysis in the petroleum laboratory',
        date: '2025-08-22',
    },
    {
        id: 6,
        src: '/gallery/placeholder-6.jpg',
        alt: 'Networking Event',
        title: 'Industry Networking',
        category: 'events',
        description: 'Connecting with industry professionals',
        date: '2025-07-30',
    },
    {
        id: 7,
        src: '/gallery/placeholder-7.jpg',
        alt: 'Hackathon Winner',
        title: 'Hackathon Victory',
        category: 'achievements',
        description: 'First place at the annual data hackathon',
        date: '2025-06-14',
    },
    {
        id: 8,
        src: '/gallery/placeholder-8.jpg',
        alt: 'Outdoor Adventure',
        title: 'Mountain Hiking',
        category: 'personal',
        description: 'Weekend hiking adventure in the mountains',
        date: '2025-05-28',
    },
];

const categoryColor: Record<string, string> = {
    work: '#c9a84c',
    events: '#3d7ab5',
    achievements: '#c9a84c',
    personal: '#555',
};

export default function GalleryPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

    const filteredImages = selectedCategory === 'all'
        ? galleryImages
        : galleryImages.filter(img => img.category === selectedCategory);

    const currentImageIndex = selectedImage !== null
        ? filteredImages.findIndex(img => img.id === selectedImage)
        : -1;

    const openLightbox = (imageId: number) => {
        setSelectedImage(imageId);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = 'unset';
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (currentImageIndex === -1) return;
        let newIndex;
        if (direction === 'prev') {
            newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : filteredImages.length - 1;
        } else {
            newIndex = currentImageIndex < filteredImages.length - 1 ? currentImageIndex + 1 : 0;
        }
        setSelectedImage(filteredImages[newIndex].id);
    };

    const currentImage = filteredImages.find(img => img.id === selectedImage);

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <GalleryBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">
                        [ GALLERY ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">
                        Visual Archive
                    </h1>
                    <p className="text-[#666] max-w-xl leading-relaxed">
                        A record of professional experiences, achievements, and personal moments.
                    </p>
                </div>
            </section>

            {/* ── Filters & view toggle ── */}
            <section className="sticky top-16 z-30 bg-[#080808]/90 backdrop-blur border-b border-[#1c1c1c]">
                <div className="container-custom py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Category filters — mono text style */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
                        {galleryCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`transition-colors ${selectedCategory === cat.id
                                    ? 'text-[#c9a84c] border-l-2 border-[#c9a84c] pl-2'
                                    : 'text-[#555] hover:text-[#e2d9c8] pl-2'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 border border-[#1c1c1c]">
                        <button
                            onClick={() => setViewMode('masonry')}
                            className={`p-2 transition-colors ${viewMode === 'masonry'
                                ? 'bg-[#1c1c1c] text-[#e2d9c8]'
                                : 'text-[#444] hover:text-[#e2d9c8]'
                            }`}
                            aria-label="Masonry view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid'
                                ? 'bg-[#1c1c1c] text-[#e2d9c8]'
                                : 'text-[#444] hover:text-[#e2d9c8]'
                            }`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Gallery grid ── */}
            <section className="py-10">
                <div className="container-custom">
                    {filteredImages.length > 0 ? (
                        <div className={
                            viewMode === 'masonry'
                                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3'
                                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                        }>
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={`group relative overflow-hidden bg-[#0f0f0f] border border-[#1c1c1c] cursor-pointer hover:border-[#333] transition-colors ${viewMode === 'masonry' ? 'break-inside-avoid' : ''}`}
                                    onClick={() => openLightbox(image.id)}
                                >
                                    {/* Placeholder image block */}
                                    <div
                                        className={`w-full bg-[#111] flex items-center justify-center ${viewMode === 'grid' ? 'aspect-square' : ''}`}
                                        style={{
                                            height: viewMode === 'masonry' ? `${200 + (index % 3) * 80}px` : undefined
                                        }}
                                    >
                                        <Camera className="h-8 w-8 text-[#2a2a2a]" />
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div className="translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <h3 className="font-semibold text-[#e2d9c8] text-sm mb-1">{image.title}</h3>
                                            <p className="text-[#999] text-xs line-clamp-2">{image.description}</p>
                                        </div>
                                        <button
                                            className="absolute top-3 right-3 p-1.5 border border-[#333] text-[#888] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#e2d9c8] hover:border-[#555]"
                                            aria-label="Zoom image"
                                        >
                                            <ZoomIn className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Category badge */}
                                    <div className="absolute top-3 left-3">
                                        <span
                                            className="font-mono text-[10px] px-1.5 py-0.5 tracking-wider"
                                            style={{
                                                backgroundColor: (categoryColor[image.category] || '#555') + '20',
                                                color: categoryColor[image.category] || '#555',
                                            }}
                                        >
                                            {image.category.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 border-b border-[#1c1c1c]">
                            <p className="font-mono text-xs text-[#444] mb-3">// NO RESULTS</p>
                            <h3 className="text-xl font-semibold text-[#e2d9c8] mb-2">No images found</h3>
                            <p className="text-[#555] text-sm">No images match the selected category.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Lightbox ── */}
            {selectedImage !== null && currentImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-5 right-5 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                        className="absolute left-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Next */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Content */}
                    <div
                        className="max-w-4xl mx-16 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Placeholder */}
                        <div className="w-full aspect-video bg-[#111] border border-[#1c1c1c] flex items-center justify-center">
                            <Camera className="h-16 w-16 text-[#222]" />
                        </div>

                        {/* Info */}
                        <div className="mt-5 w-full flex items-start justify-between gap-6">
                            <div>
                                <h2 className="font-semibold text-[#e2d9c8] mb-1">{currentImage.title}</h2>
                                <p className="text-sm text-[#555]">{currentImage.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-mono text-xs text-[#444]">
                                    {new Date(currentImage.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="font-mono text-xs text-[#c9a84c] mt-1">
                                    {currentImageIndex + 1} / {filteredImages.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
