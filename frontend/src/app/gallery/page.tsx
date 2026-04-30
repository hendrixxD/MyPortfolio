'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, Grid3X3, LayoutGrid } from 'lucide-react';
import { GalleryBackground } from '@/components/backgrounds/AnimatedBackgrounds';

// Sample gallery data - Replace with API data or CMS
const galleryCategories = [
    { id: 'all', name: 'All' },
    { id: 'work', name: 'Work' },
    { id: 'events', name: 'Events' },
    { id: 'personal', name: 'Personal' },
    { id: 'achievements', name: 'Achievements' },
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
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <GalleryBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <Camera className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Photo <span className="gradient-text">Gallery</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        A visual journey through my professional experiences, achievements, and personal moments
                    </p>
                </div>
            </section>

            {/* Filter & View Controls */}
            <section className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
                <div className="container-custom py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Category Filters */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {galleryCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category.id
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('masonry')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'masonry'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                aria-label="Masonry view"
                            >
                                <LayoutGrid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm'
                                    : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                aria-label="Grid view"
                            >
                                <Grid3X3 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="section-padding bg-slate-50 dark:bg-slate-800/50">
                <div className="container-custom">
                    {filteredImages.length > 0 ? (
                        <div className={
                            viewMode === 'masonry'
                                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'
                                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                        }>
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={`group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-lg cursor-pointer card-animate ${viewMode === 'masonry' ? 'break-inside-avoid' : ''
                                        }`}
                                    onClick={() => openLightbox(image.id)}
                                    style={{
                                        animationDelay: `${index * 0.05}s`
                                    }}
                                >
                                    {/* Image Container */}
                                    <div className={`relative ${viewMode === 'grid' ? 'aspect-square' : ''} overflow-hidden`}>
                                        {/* Placeholder colored background - Replace with actual images */}
                                        <div
                                            className={`w-full bg-gradient-to-br ${index % 4 === 0 ? 'from-primary-400 to-primary-600' :
                                                index % 4 === 1 ? 'from-accent-400 to-accent-600' :
                                                    index % 4 === 2 ? 'from-blue-400 to-blue-600' :
                                                        'from-amber-400 to-amber-600'
                                                } ${viewMode === 'grid' ? 'aspect-square' : ''}`}
                                            style={{
                                                height: viewMode === 'masonry' ? `${200 + (index % 3) * 80}px` : undefined
                                            }}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Camera className="h-12 w-12 text-white/50" />
                                            </div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-white font-semibold text-lg mb-1">{image.title}</h3>
                                                <p className="text-white/80 text-sm line-clamp-2">{image.description}</p>
                                            </div>
                                            <button
                                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
                                                aria-label="Zoom image"
                                            >
                                                <ZoomIn className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${image.category === 'work' ? 'bg-primary-500/80 text-white' :
                                            image.category === 'events' ? 'bg-accent-500/80 text-white' :
                                                image.category === 'achievements' ? 'bg-amber-500/80 text-white' :
                                                    'bg-blue-500/80 text-white'
                                            }`}>
                                            {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Camera className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                No images found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500">
                                No images match the selected category
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage !== null && currentImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                        aria-label="Close lightbox"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Navigation Buttons */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-50"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>

                    {/* Image Content */}
                    <div
                        className="max-w-5xl max-h-[85vh] mx-4 flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Placeholder Image */}
                        <div
                            className={`w-full max-w-3xl aspect-video rounded-lg bg-gradient-to-br ${currentImage.id % 4 === 1 ? 'from-primary-400 to-primary-600' :
                                currentImage.id % 4 === 2 ? 'from-accent-400 to-accent-600' :
                                    currentImage.id % 4 === 3 ? 'from-blue-400 to-blue-600' :
                                        'from-amber-400 to-amber-600'
                                } flex items-center justify-center`}
                        >
                            <Camera className="h-20 w-20 text-white/50" />
                        </div>

                        {/* Image Info */}
                        <div className="mt-6 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h2>
                            <p className="text-white/70 max-w-xl">{currentImage.description}</p>
                            <p className="text-white/50 text-sm mt-2">
                                {new Date(currentImage.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Image Counter */}
                        <div className="mt-4 px-4 py-2 bg-white/10 rounded-full text-white/70 text-sm">
                            {currentImageIndex + 1} / {filteredImages.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
