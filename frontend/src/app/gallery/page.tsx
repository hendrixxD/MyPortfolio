'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, Grid3X3, LayoutGrid } from 'lucide-react';
import { GalleryBackground } from '@/components/backgrounds/AnimatedBackgrounds';

interface GalleryImage {
    filename: string;
    url: string;
    size: number;
    uploaded_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

    useEffect(() => {
        fetch(`${API_URL}/api/v1/upload/images/public`)
            .then(r => r.json())
            .then(data => setImages(data.images || []))
            .catch(() => setImages([]))
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedIndex(null);
        document.body.style.overflow = 'unset';
    };

    const navigate = (dir: 'prev' | 'next') => {
        if (selectedIndex === null) return;
        if (dir === 'prev') setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
        else setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    };

    const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <GalleryBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">[ GALLERY ]</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">Visual Archive</h1>
                    <div className="flex flex-wrap gap-8 font-mono text-xs text-[#555]">
                        {images.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{images.length}</span>
                                IMAGES
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ── View toggle ── */}
            <section className="py-4 border-b border-[#1c1c1c]">
                <div className="container-custom flex justify-end">
                    <div className="flex items-center gap-px border border-[#1c1c1c]">
                        <button
                            onClick={() => setViewMode('masonry')}
                            className={`p-2 transition-colors ${viewMode === 'masonry' ? 'bg-[#1c1c1c] text-[#e2d9c8]' : 'text-[#444] hover:text-[#e2d9c8]'}`}
                            aria-label="Masonry view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#1c1c1c] text-[#e2d9c8]' : 'text-[#444] hover:text-[#e2d9c8]'}`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Gallery ── */}
            <section className="py-10">
                <div className="container-custom">
                    {loading ? (
                        <div className="py-20 text-center font-mono text-xs text-[#444]">// LOADING</div>
                    ) : images.length === 0 ? (
                        <div className="py-20 border border-[#1c1c1c] text-center">
                            <Camera className="h-8 w-8 text-[#2a2a2a] mx-auto mb-3" />
                            <p className="font-mono text-xs text-[#444]">// NO IMAGES YET</p>
                        </div>
                    ) : (
                        <div className={
                            viewMode === 'masonry'
                                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3'
                                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                        }>
                            {images.map((image, index) => (
                                <div
                                    key={image.filename}
                                    className={`group relative overflow-hidden bg-[#0f0f0f] border border-[#1c1c1c] cursor-pointer hover:border-[#333] transition-colors ${viewMode === 'masonry' ? 'break-inside-avoid' : ''}`}
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={`${API_URL}${image.url}`}
                                        alt={image.filename}
                                        className={`w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity ${viewMode === 'grid' ? 'aspect-square' : ''}`}
                                        style={viewMode === 'masonry' ? { display: 'block' } : undefined}
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                                        <p className="font-mono text-[10px] text-[#888]">
                                            {new Date(image.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        <button className="p-1.5 border border-[#333] text-[#888] hover:text-[#e2d9c8] transition-colors" aria-label="Zoom">
                                            <ZoomIn className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Lightbox ── */}
            {selectedIndex !== null && currentImage && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-5 right-5 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate('prev'); }} className="absolute left-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50" aria-label="Previous">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate('next'); }} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50" aria-label="Next">
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    <div className="max-w-4xl mx-16 flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={`${API_URL}${currentImage.url}`}
                            alt={currentImage.filename}
                            className="max-h-[75vh] w-auto object-contain border border-[#1c1c1c]"
                        />
                        <div className="mt-4 w-full flex items-center justify-between">
                            <p className="font-mono text-xs text-[#555] truncate max-w-xs">{currentImage.filename}</p>
                            <p className="font-mono text-xs text-[#c9a84c] shrink-0 ml-4">
                                {selectedIndex + 1} / {images.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
