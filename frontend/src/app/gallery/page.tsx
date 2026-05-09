'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera, Grid3X3, LayoutGrid, Tag as TagIcon, Loader2 } from 'lucide-react';
import { GalleryBackground } from '@/components/backgrounds/AnimatedBackgrounds';
import { getGalleryItems, getGalleryTags, getGalleryItem } from '@/lib/api';
import type { GalleryItemBrief, GalleryTag, GalleryItem } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItemBrief[]>([]);
    const [tags, setTags] = useState<GalleryTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [loadingItem, setLoadingItem] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
    const [filterTag, setFilterTag] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getGalleryItems({ tag: filterTag || undefined }),
            getGalleryTags(),
        ])
            .then(([itemsData, tagsData]) => {
                setItems(itemsData);
                setTags(tagsData);
            })
            .catch(() => {
                setItems([]);
                setTags([]);
            })
            .finally(() => setLoading(false));
    }, [filterTag]);

    const openLightbox = async (index: number) => {
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden';

        // Fetch full item details
        const item = items[index];
        setLoadingItem(true);
        try {
            const fullItem = await getGalleryItem(item.id);
            setSelectedItem(fullItem);
        } catch (err) {
            console.error('Failed to load item details:', err);
            // Fallback to brief item
            setSelectedItem(item as any);
        } finally {
            setLoadingItem(false);
        }
    };

    const closeLightbox = () => {
        setSelectedIndex(null);
        setSelectedItem(null);
        document.body.style.overflow = 'unset';
    };

    const navigate = async (dir: 'prev' | 'next') => {
        if (selectedIndex === null) return;
        const newIndex = dir === 'prev'
            ? (selectedIndex > 0 ? selectedIndex - 1 : items.length - 1)
            : (selectedIndex < items.length - 1 ? selectedIndex + 1 : 0);

        setSelectedIndex(newIndex);

        // Load new item details
        const item = items[newIndex];
        setLoadingItem(true);
        try {
            const fullItem = await getGalleryItem(item.id);
            setSelectedItem(fullItem);
        } catch (err) {
            console.error('Failed to load item details:', err);
            setSelectedItem(item as any);
        } finally {
            setLoadingItem(false);
        }
    };

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <GalleryBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">[ GALLERY ]</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">Visual Archive</h1>
                    <div className="flex flex-wrap gap-8 font-mono text-xs text-[#555]">
                        {items.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{items.length}</span>
                                IMAGES
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Tags & View toggle ── */}
            <section className="py-4 border-b border-[#1c1c1c]">
                <div className="container-custom flex flex-wrap items-center gap-4 justify-between">
                    {/* Tag filter */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <TagIcon className="h-4 w-4 text-[#444]" />
                            <button
                                onClick={() => setFilterTag(null)}
                                className={`px-2.5 py-1 font-mono text-[10px] transition-colors ${!filterTag ? 'bg-[#c9a84c] text-[#080808]' : 'border border-[#1c1c1c] text-[#555] hover:border-[#333] hover:text-[#888]'}`}
                            >
                                ALL
                            </button>
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => setFilterTag(tag.slug)}
                                    className={`px-2.5 py-1 font-mono text-[10px] transition-colors ${filterTag === tag.slug ? 'text-[#080808]' : 'border border-[#1c1c1c] text-[#555] hover:border-[#333] hover:text-[#888]'}`}
                                    style={{
                                        backgroundColor: filterTag === tag.slug ? (tag.color || '#c9a84c') : undefined,
                                        borderColor: filterTag === tag.slug ? (tag.color || '#c9a84c') : undefined,
                                    }}
                                >
                                    {tag.name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* View toggle */}
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
                    ) : items.length === 0 ? (
                        <div className="py-20 border border-[#1c1c1c] text-center">
                            <Camera className="h-8 w-8 text-[#2a2a2a] mx-auto mb-3" />
                            <p className="font-mono text-xs text-[#444]">// NO IMAGES {filterTag ? 'WITH THIS TAG' : 'YET'}</p>
                        </div>
                    ) : (
                        <div className={
                            viewMode === 'masonry'
                                ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3'
                                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
                        }>
                            {items.map((image, index) => (
                                <div
                                    key={image.id}
                                    className={`group relative overflow-hidden bg-[#0f0f0f] border border-[#1c1c1c] cursor-pointer hover:border-[#333] transition-colors ${viewMode === 'masonry' ? 'break-inside-avoid' : viewMode === 'grid' ? 'aspect-square' : ''}`}
                                    onClick={() => openLightbox(index)}
                                >
                                    {viewMode === 'grid' ? (
                                        <Image
                                            src={`${API_URL}${image.url}`}
                                            alt={image.caption || image.filename}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <img
                                            src={`${API_URL}${image.url}`}
                                            alt={image.caption || image.filename}
                                            className="w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity block"
                                        />
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        {image.caption && (
                                            <p className="font-mono text-[10px] text-[#e2d9c8] mb-2 line-clamp-2">{image.caption}</p>
                                        )}
                                        <div className="flex items-end justify-between">
                                            {image.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 flex-1">
                                                    {image.tags.slice(0, 3).map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            className="font-mono text-[8px] px-1.5 py-0.5 border border-[#333]"
                                                            style={{ borderColor: tag.color || undefined, color: tag.color || undefined }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <button className="p-1.5 border border-[#333] text-[#888] hover:text-[#e2d9c8] transition-colors ml-2" aria-label="Zoom">
                                                <ZoomIn className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Lightbox ── */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-5 right-5 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
                        disabled={loadingItem}
                        className="absolute left-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50 disabled:opacity-50"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate('next'); }}
                        disabled={loadingItem}
                        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 border border-[#333] text-[#888] hover:text-[#e2d9c8] hover:border-[#555] transition-colors z-50 disabled:opacity-50"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {loadingItem ? (
                        <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
                            <Loader2 className="h-8 w-8 text-[#c9a84c] animate-spin" />
                        </div>
                    ) : selectedItem ? (
                        <div className="max-w-5xl mx-16 flex flex-col items-center max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <img
                                src={`${API_URL}${selectedItem.url}`}
                                alt={selectedItem.caption || selectedItem.filename}
                                className="max-h-[60vh] w-auto object-contain border border-[#1c1c1c]"
                            />
                            <div className="mt-6 w-full space-y-4 px-4">
                                {/* Caption */}
                                {selectedItem.caption && (
                                    <div className="text-center">
                                        <p className="font-mono text-base text-[#e2d9c8]">{selectedItem.caption}</p>
                                    </div>
                                )}

                                {/* Description */}
                                {selectedItem.description && (
                                    <div className="text-center max-w-2xl mx-auto">
                                        <p className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                                    </div>
                                )}

                                {/* Tags */}
                                {selectedItem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {selectedItem.tags.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="font-mono text-[10px] px-2 py-1 border border-[#333]"
                                                style={{ borderColor: tag.color || undefined, color: tag.color || undefined }}
                                            >
                                                {tag.name.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="flex items-center justify-between text-[#555] border-t border-[#1c1c1c] pt-4">
                                    <p className="font-mono text-xs">
                                        {new Date(selectedItem.published_at || selectedItem.uploaded_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="font-mono text-xs text-[#c9a84c]">
                                        {selectedIndex + 1} / {items.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
