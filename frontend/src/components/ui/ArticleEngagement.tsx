'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Twitter, Mail, MessageCircle, BookmarkPlus, Check, Copy, X } from 'lucide-react';

interface ArticleEngagementProps {
    title: string;
    url?: string;
    summary?: string;
    initialLikes?: number;
    articleId?: number;
}

export function ArticleEngagement({
    title,
    url,
    summary = '',
    initialLikes = 0,
    articleId
}: ArticleEngagementProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    // Check if article was liked/saved before
    useEffect(() => {
        if (typeof window !== 'undefined' && articleId) {
            const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
            const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
            setIsLiked(likedArticles.includes(articleId));
            setSaved(savedArticles.includes(articleId));
        }
    }, [articleId]);

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleLike = () => {
        if (typeof window === 'undefined') return;

        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');

        if (isLiked) {
            // Unlike
            const filtered = likedArticles.filter((id: number) => id !== articleId);
            localStorage.setItem('likedArticles', JSON.stringify(filtered));
            setLikes(prev => Math.max(0, prev - 1));
            setIsLiked(false);
        } else {
            // Like
            likedArticles.push(articleId);
            localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
            setLikes(prev => prev + 1);
            setIsLiked(true);
        }
    };

    const handleSaveToNotes = () => {
        if (typeof window === 'undefined') return;

        const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        const savedNotesData = JSON.parse(localStorage.getItem('savedNotesData') || '{}');

        if (saved) {
            // Remove from saved
            const filtered = savedArticles.filter((id: number) => id !== articleId);
            localStorage.setItem('savedArticles', JSON.stringify(filtered));
            delete savedNotesData[articleId!];
            localStorage.setItem('savedNotesData', JSON.stringify(savedNotesData));
            setSaved(false);
        } else {
            // Save
            savedArticles.push(articleId);
            localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
            savedNotesData[articleId!] = {
                title,
                url: currentUrl,
                summary,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('savedNotesData', JSON.stringify(savedNotesData));
            setSaved(true);
        }
    };

    const shareOptions = [
        {
            name: 'X (Twitter)',
            icon: Twitter,
            color: 'hover:bg-zinc-800 hover:text-white',
            action: () => {
                const text = encodeURIComponent(`${title}\n\n${currentUrl}`);
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420');
            }
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'hover:bg-green-600 hover:text-white',
            action: () => {
                const text = encodeURIComponent(`${title}\n\n${currentUrl}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
            }
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'hover:bg-blue-600 hover:text-white',
            action: () => {
                const subject = encodeURIComponent(title);
                const body = encodeURIComponent(`Check out this article:\n\n${title}\n\n${summary}\n\nRead more: ${currentUrl}`);
                window.open(`mailto:?subject=${subject}&body=${body}`);
            }
        },
        {
            name: 'Copy Link',
            icon: copied ? Check : Copy,
            color: copied ? 'bg-green-600 text-white' : 'hover:bg-zinc-700 hover:text-white',
            action: async () => {
                try {
                    await navigator.clipboard.writeText(currentUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = currentUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }
        }
    ];

    return (
        <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
                onClick={handleLike}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${isLiked
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400'
                    }`}
                aria-label={isLiked ? 'Unlike article' : 'Like article'}
            >
                <Heart
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`}
                />
                <span className="text-sm font-medium">{likes > 0 ? likes : 'Like'}</span>
            </button>

            {/* Share Button + Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-300"
                    aria-label="Share article"
                >
                    <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-medium">Share</span>
                </button>

                {/* Share Dropdown */}
                {showShareMenu && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowShareMenu(false)}
                        />

                        {/* Menu */}
                        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                                <div className="flex items-center justify-between px-3 py-2 mb-1">
                                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Share via</span>
                                    <button
                                        onClick={() => setShowShareMenu(false)}
                                        className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-zinc-500" />
                                    </button>
                                </div>

                                {shareOptions.map((option) => (
                                    <button
                                        key={option.name}
                                        onClick={() => {
                                            option.action();
                                            if (option.name !== 'Copy Link') {
                                                setShowShareMenu(false);
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-300 transition-all duration-200 ${option.color}`}
                                    >
                                        <option.icon className="w-4 h-4" />
                                        <span className="text-sm">{option.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Save to Notes Button */}
            <button
                onClick={handleSaveToNotes}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${saved
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400'
                    }`}
                aria-label={saved ? 'Remove from notes' : 'Save to notes'}
            >
                <BookmarkPlus
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${saved ? 'fill-current' : ''}`}
                />
                <span className="text-sm font-medium hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
            </button>
        </div>
    );
}
