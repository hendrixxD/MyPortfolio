'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Trash2, Heart, MoreHorizontal, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    articleId: number;
    author: string;
    content: string;
    createdAt: string;
    likes: number;
    likedBy: string[];
}

interface ArticleCommentsProps {
    articleId: number;
    articleTitle: string;
}

export function ArticleComments({ articleId, articleTitle }: ArticleCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string>('');

    // Generate or get session ID for tracking user's own comments
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('commentSessionId');
            if (!id) {
                id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('commentSessionId', id);
            }
            setSessionId(id);
        }
    }, []);

    // Load comments from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedComments = JSON.parse(localStorage.getItem('articleComments') || '{}');
            const articleComments = storedComments[articleId] || [];
            setComments(articleComments);

            // Load saved author name
            const savedAuthor = localStorage.getItem('commentAuthorName');
            if (savedAuthor) setAuthorName(savedAuthor);
        }
    }, [articleId]);

    const saveComments = (newComments: Comment[]) => {
        const storedComments = JSON.parse(localStorage.getItem('articleComments') || '{}');
        storedComments[articleId] = newComments;
        localStorage.setItem('articleComments', JSON.stringify(storedComments));
        setComments(newComments);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;

        setIsSubmitting(true);

        // Save author name for future comments
        localStorage.setItem('commentAuthorName', authorName);

        const comment: Comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            articleId,
            author: authorName.trim(),
            content: newComment.trim(),
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
        };

        // Add to comments
        const updatedComments = [comment, ...comments];
        saveComments(updatedComments);

        setNewComment('');
        setIsSubmitting(false);
        setShowCommentForm(false);
    };

    const handleLikeComment = (commentId: string) => {
        const updatedComments = comments.map((comment) => {
            if (comment.id === commentId) {
                const hasLiked = comment.likedBy.includes(sessionId);
                return {
                    ...comment,
                    likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
                    likedBy: hasLiked
                        ? comment.likedBy.filter((id) => id !== sessionId)
                        : [...comment.likedBy, sessionId],
                };
            }
            return comment;
        });
        saveComments(updatedComments);
    };

    const handleDeleteComment = (commentId: string) => {
        const updatedComments = comments.filter((c) => c.id !== commentId);
        saveComments(updatedComments);
    };

    return (
        <div className="mt-16 pt-12 border-t border-zinc-800/60">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/20">
                        <MessageCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">Discussion</h3>
                        <p className="text-sm text-zinc-500">
                            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                        </p>
                    </div>
                </div>

                {!showCommentForm && (
                    <button
                        onClick={() => setShowCommentForm(true)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 hover:from-amber-400 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                    >
                        Leave a Comment
                    </button>
                )}
            </div>

            {/* Comment Form */}
            {showCommentForm && (
                <div className="mb-8 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white">Share your thoughts</h4>
                        <button
                            onClick={() => setShowCommentForm(false)}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="author" className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Your name
                            </label>
                            <input
                                type="text"
                                id="author"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Your comment
                            </label>
                            <textarea
                                id="comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What are your thoughts on this article?"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder-zinc-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all resize-none"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500">
                                Comments are stored locally in your browser
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-zinc-900 hover:from-amber-400 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                            >
                                <Send className="w-4 h-4" />
                                Post Comment
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-12 px-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h4 className="text-lg font-medium text-zinc-300 mb-2">No comments yet</h4>
                        <p className="text-sm text-zinc-500 mb-4">
                            Be the first to share your thoughts on this article.
                        </p>
                        {!showCommentForm && (
                            <button
                                onClick={() => setShowCommentForm(true)}
                                className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
                            >
                                Start the discussion →
                            </button>
                        )}
                    </div>
                ) : (
                    comments.map((comment) => {
                        const hasLiked = comment.likedBy.includes(sessionId);
                        const isOwnComment = comment.id.includes(sessionId.split('_')[1] || '');

                        return (
                            <div
                                key={comment.id}
                                className="group p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300"
                            >
                                {/* Comment Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/20 flex items-center justify-center border border-amber-500/20">
                                            <User className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-white">{comment.author}</h5>
                                            <p className="text-xs text-zinc-500">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions for own comments */}
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete comment"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Comment Content */}
                                <p className="text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                    {comment.content}
                                </p>

                                {/* Comment Footer */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleLikeComment(comment.id)}
                                        className={`inline-flex items-center gap-1.5 text-sm transition-colors ${hasLiked
                                                ? 'text-red-400'
                                                : 'text-zinc-500 hover:text-red-400'
                                            }`}
                                    >
                                        <Heart
                                            className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`}
                                        />
                                        <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
