'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Upload, Trash2, Edit2, Tag, X, Plus, Star, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Send } from 'lucide-react';
import {
    getAllGalleryItems,
    uploadGalleryImage,
    updateGalleryItem,
    deleteGalleryItem,
    publishGalleryItem,
    unpublishGalleryItem,
    getGalleryTags,
    createGalleryTag,
    updateGalleryTag,
    deleteGalleryTag,
} from '@/lib/api';
import { validateImageFile, validateFileName } from '@/lib/fileValidation';
import type { GalleryItemBrief, GalleryTag } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UploadProgress {
    filename: string;
    status: 'uploading' | 'success' | 'error';
    message?: string;
}

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItemBrief[]>([]);
    const [tags, setTags] = useState<GalleryTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<GalleryItemBrief | null>(null);
    const [managingTags, setManagingTags] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editForm, setEditForm] = useState({
        caption: '',
        description: '',
        alt_text: '',
        status: 'draft' as 'draft' | 'published',
        is_featured: false,
        order: 0,
        tag_ids: [] as number[],
    });

    const [tagForm, setTagForm] = useState({ name: '', color: '#c9a84c' });
    const [editingTag, setEditingTag] = useState<GalleryTag | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const url = `/api/v1/gallery/items/all?${filterTag ? `tag=${filterTag}&` : ''}${statusFilter !== 'all' ? `status=${statusFilter}` : ''}`;
            const [itemsData, tagsData] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                }).then(r => r.json()),
                getGalleryTags(),
            ]);
            setItems(itemsData);
            setTags(tagsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filterTag, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const progressItems: UploadProgress[] = fileArray.map(f => ({
            filename: f.name,
            status: 'uploading'
        }));
        setUploadProgress(progressItems);

        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];

            // Validate file name
            const nameValidation = validateFileName(file.name);
            if (!nameValidation.valid) {
                setUploadProgress(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', message: nameValidation.error } : item
                ));
                continue;
            }

            // Validate file content
            const fileValidation = validateImageFile(file);
            if (!fileValidation.valid) {
                setUploadProgress(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', message: fileValidation.error } : item
                ));
                continue;
            }

            try {
                await uploadGalleryImage(file);
                setUploadProgress(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'success' } : item
                ));
            } catch (err: any) {
                setUploadProgress(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', message: err.message } : item
                ));
            }
        }

        // Clear progress after 3 seconds
        setTimeout(() => setUploadProgress([]), 3000);
        load();
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteGalleryItem(id);
            setConfirmDelete(null);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const openEditModal = (item: GalleryItemBrief) => {
        setEditingItem(item);
        setEditForm({
            caption: item.caption || '',
            description: '',
            alt_text: '',
            status: item.status,
            is_featured: item.is_featured,
            order: 0,
            tag_ids: item.tags.map(t => t.id),
        });
    };

    const handlePublish = async (id: number) => {
        try {
            await publishGalleryItem(id);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUnpublish = async (id: number) => {
        try {
            await unpublishGalleryItem(id);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        try {
            await updateGalleryItem(editingItem.id, editForm);
            setEditingItem(null);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateTag = async () => {
        if (!tagForm.name) return;
        try {
            await createGalleryTag(tagForm);
            setTagForm({ name: '', color: '#c9a84c' });
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag) return;
        try {
            await updateGalleryTag(editingTag.id, { name: editingTag.name, color: editingTag.color || undefined });
            setEditingTag(null);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteTag = async (id: number) => {
        if (!confirm('Delete this tag? It will be removed from all images.')) return;
        try {
            await deleteGalleryTag(id);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-0.5">[ GALLERY ]</p>
                    <span className="font-mono text-[10px] text-[#444]">{items.length} IMAGES</span>
                </div>
                <button
                    onClick={() => setManagingTags(true)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors font-mono text-xs"
                >
                    <Tag className="h-3.5 w-3.5" />
                    MANAGE TAGS
                </button>
            </div>

            {/* Status filter */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="font-mono text-[10px] text-[#555] uppercase">Status:</span>
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${statusFilter === 'all' ? 'bg-[#c9a84c] text-[#080808]' : 'border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40'}`}
                >
                    ALL
                </button>
                <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${statusFilter === 'draft' ? 'bg-[#888] text-[#080808]' : 'border border-[#2a2a2a] text-[#888] hover:border-[#888]/40'}`}
                >
                    DRAFT
                </button>
                <button
                    onClick={() => setStatusFilter('published')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${statusFilter === 'published' ? 'bg-green-600 text-white' : 'border border-[#2a2a2a] text-[#888] hover:border-green-600/40'}`}
                >
                    PUBLISHED
                </button>
            </div>

            {/* Tag filter */}
            {tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <span className="font-mono text-[10px] text-[#555] uppercase">Tags:</span>
                    <button
                        onClick={() => setFilterTag(null)}
                        className={`px-3 py-1 font-mono text-xs transition-colors ${!filterTag ? 'bg-[#c9a84c] text-[#080808]' : 'border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40'}`}
                    >
                        ALL
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => setFilterTag(tag.slug)}
                            className={`px-3 py-1 font-mono text-xs transition-colors ${filterTag === tag.slug ? 'bg-[#c9a84c] text-[#080808]' : 'border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40'}`}
                            style={tag.color ? { borderColor: filterTag === tag.slug ? tag.color : undefined } : undefined}
                        >
                            {tag.name.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}

            {/* Upload zone */}
            <div
                className={`border-2 border-dashed transition-colors mb-6 ${dragOver ? 'border-[#c9a84c]/60 bg-[#c9a84c]/5' : 'border-[#2a2a2a] hover:border-[#333]'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                <div className="p-10 flex flex-col items-center gap-3 text-center">
                    <Upload className={`h-8 w-8 ${dragOver ? 'text-[#c9a84c]' : 'text-[#333]'}`} />
                    <div>
                        <p className="font-mono text-xs text-[#888] mb-1">DRAG & DROP IMAGES HERE</p>
                        <p className="font-mono text-[10px] text-[#444]">JPG, PNG, GIF, WEBP — max 10MB each</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadProgress.length > 0}
                        className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-4 py-1.5 hover:bg-[#d4b56a] transition-colors disabled:opacity-50 mt-1"
                    >
                        SELECT FILES
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => handleUpload(e.target.files)}
                    />
                </div>
            </div>

            {/* Upload progress */}
            {uploadProgress.length > 0 && (
                <div className="mb-6 space-y-2">
                    {uploadProgress.map((progress, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border border-[#2a2a2a] bg-[#0a0a0a]">
                            {progress.status === 'uploading' && (
                                <Loader2 className="h-4 w-4 text-[#c9a84c] animate-spin flex-shrink-0" />
                            )}
                            {progress.status === 'success' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            {progress.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-mono text-xs text-[#888] truncate">{progress.filename}</p>
                                {progress.message && (
                                    <p className="font-mono text-[10px] text-red-400">{progress.message}</p>
                                )}
                            </div>
                            {progress.status === 'uploading' && (
                                <span className="font-mono text-[10px] text-[#555]">UPLOADING...</span>
                            )}
                            {progress.status === 'success' && (
                                <span className="font-mono text-[10px] text-green-500">UPLOADED</span>
                            )}
                            {progress.status === 'error' && (
                                <span className="font-mono text-[10px] text-red-400">FAILED</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Image cards grid */}
            {loading ? (
                <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
            ) : items.length === 0 ? (
                <div className="p-12 text-center border border-[#1c1c1c]">
                    <Upload className="h-8 w-8 text-[#2a2a2a] mx-auto mb-3" />
                    <p className="font-mono text-xs text-[#444]">// NO IMAGES {filterTag ? 'WITH THIS TAG' : 'UPLOADED YET'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#0f0f0f] border border-[#1c1c1c] hover:border-[#333] transition-colors group"
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src={`${API_URL}${item.url}`}
                                    alt={item.caption || item.filename}
                                    className="w-full h-full object-cover"
                                />

                                {/* Status & Featured badges */}
                                <div className="absolute top-2 left-2 flex gap-2">
                                    <div className={`px-2 py-0.5 font-mono text-[9px] ${item.status === 'published' ? 'bg-green-600 text-white' : 'bg-[#888] text-[#080808]'}`}>
                                        {item.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                                    </div>
                                    {item.is_featured && (
                                        <div className="p-1 bg-[#c9a84c]">
                                            <Star className="h-3 w-3 fill-current text-[#080808]" />
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons on hover */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="p-2 bg-[#0a0a0a]/90 border border-[#333] text-[#888] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(item.id)}
                                        className="p-2 bg-[#0a0a0a]/90 border border-red-800/40 text-red-400 hover:bg-red-900/20 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info panel - always visible */}
                            <div className="p-3 space-y-2">
                                {/* Caption */}
                                <div className="min-h-[2.5rem]">
                                    {item.caption ? (
                                        <p className="font-mono text-xs text-[#e2d9c8] line-clamp-2">{item.caption}</p>
                                    ) : (
                                        <p className="font-mono text-xs text-[#444] italic">No caption</p>
                                    )}
                                </div>

                                {/* Tags */}
                                {item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="font-mono text-[9px] px-1.5 py-0.5 border border-[#2a2a2a]"
                                                style={{ borderColor: tag.color || undefined, color: tag.color || undefined }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Meta info */}
                                <div className="flex items-center justify-between pt-1 border-t border-[#1c1c1c]">
                                    <p className="font-mono text-[9px] text-[#555]">{formatSize(item.size)}</p>
                                    <p className="font-mono text-[9px] text-[#555]">
                                        {item.width && item.height ? `${item.width}×${item.height}` : 'N/A'}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="px-3 py-1.5 border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40 hover:text-[#c9a84c] transition-colors font-mono text-[10px] flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                        EDIT
                                    </button>
                                    {item.status === 'draft' ? (
                                        <button
                                            onClick={() => handlePublish(item.id)}
                                            className="px-3 py-1.5 bg-green-600/20 border border-green-600/40 text-green-400 hover:bg-green-600/30 transition-colors font-mono text-[10px] flex items-center justify-center gap-2"
                                        >
                                            <Send className="h-3 w-3" />
                                            PUBLISH
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUnpublish(item.id)}
                                            className="px-3 py-1.5 border border-[#2a2a2a] text-[#888] hover:border-[#888]/60 hover:text-[#aaa] transition-colors font-mono text-[10px] flex items-center justify-center gap-2"
                                        >
                                            <EyeOff className="h-3 w-3" />
                                            UNPUBLISH
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-2xl w-full my-8">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">[ EDIT IMAGE ]</p>
                            <button onClick={() => setEditingItem(null)} className="text-[#444] hover:text-[#e2d9c8]">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-4 border border-[#1c1c1c]">
                            <img src={`${API_URL}${editingItem.url}`} alt="" className="w-full h-auto" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-mono text-[10px] text-[#555] mb-1.5 uppercase">Caption</label>
                                <input
                                    type="text"
                                    value={editForm.caption}
                                    onChange={e => setEditForm({ ...editForm, caption: e.target.value })}
                                    className="input-field"
                                    placeholder="Short caption..."
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block font-mono text-[10px] text-[#555] mb-1.5 uppercase">Description (optional)</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="Longer description for modal view..."
                                />
                            </div>

                            <div>
                                <label className="block font-mono text-[10px] text-[#555] mb-1.5 uppercase">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => {
                                                const selected = editForm.tag_ids.includes(tag.id);
                                                setEditForm({
                                                    ...editForm,
                                                    tag_ids: selected
                                                        ? editForm.tag_ids.filter(id => id !== tag.id)
                                                        : [...editForm.tag_ids, tag.id]
                                                });
                                            }}
                                            className={`px-2 py-1 font-mono text-[10px] border transition-colors ${editForm.tag_ids.includes(tag.id) ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-[#2a2a2a] text-[#555]'}`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-mono text-[10px] text-[#555] mb-1.5 uppercase">Status</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditForm({ ...editForm, status: 'draft' })}
                                        className={`flex-1 px-3 py-2 font-mono text-xs transition-colors ${editForm.status === 'draft' ? 'bg-[#888] text-[#080808]' : 'border border-[#2a2a2a] text-[#888] hover:border-[#888]/40'}`}
                                    >
                                        DRAFT
                                    </button>
                                    <button
                                        onClick={() => setEditForm({ ...editForm, status: 'published' })}
                                        className={`flex-1 px-3 py-2 font-mono text-xs transition-colors ${editForm.status === 'published' ? 'bg-green-600 text-white' : 'border border-[#2a2a2a] text-[#888] hover:border-green-600/40'}`}
                                    >
                                        PUBLISHED
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.is_featured}
                                        onChange={e => setEditForm({ ...editForm, is_featured: e.target.checked })}
                                        className="form-checkbox h-4 w-4 text-[#c9a84c] bg-[#0a0a0a] border-[#2a2a2a]"
                                    />
                                    <span className="font-mono text-xs text-[#888]">Featured</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 px-4 py-2 border border-[#2a2a2a] text-[#888] font-mono text-xs hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-2 bg-[#c9a84c] text-[#080808] font-mono text-xs hover:bg-[#d4b56a] transition-colors"
                                >
                                    SAVE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tag management modal */}
            {managingTags && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-md w-full my-8">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">[ MANAGE TAGS ]</p>
                            <button onClick={() => setManagingTags(false)} className="text-[#444] hover:text-[#e2d9c8]">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="font-mono text-[10px] text-[#555] mb-2 uppercase">Create New Tag</p>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagForm.name}
                                    onChange={e => setTagForm({ ...tagForm, name: e.target.value })}
                                    className="input-field flex-1"
                                    placeholder="Tag name..."
                                />
                                <input
                                    type="color"
                                    value={tagForm.color}
                                    onChange={e => setTagForm({ ...tagForm, color: e.target.value })}
                                    className="w-10 h-10 bg-[#0a0a0a] border border-[#2a2a2a] cursor-pointer"
                                />
                            </div>
                            <button
                                onClick={handleCreateTag}
                                className="w-full px-4 py-2 bg-[#c9a84c] text-[#080808] font-mono text-xs hover:bg-[#d4b56a] transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                CREATE TAG
                            </button>
                        </div>

                        <div>
                            <p className="font-mono text-[10px] text-[#555] mb-2 uppercase">Existing Tags</p>
                            <div className="space-y-2">
                                {tags.map(tag => (
                                    editingTag?.id === tag.id ? (
                                        <div key={tag.id} className="flex gap-2 p-2 bg-[#111] border border-[#2a2a2a]">
                                            <input
                                                type="text"
                                                value={editingTag.name}
                                                onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                                                className="input-field flex-1"
                                            />
                                            <input
                                                type="color"
                                                value={editingTag.color || '#c9a84c'}
                                                onChange={e => setEditingTag({ ...editingTag, color: e.target.value })}
                                                className="w-8 h-8 bg-[#0a0a0a] border border-[#2a2a2a] cursor-pointer"
                                            />
                                            <button onClick={handleUpdateTag} className="px-2 text-[#c9a84c] hover:text-[#d4b56a]">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setEditingTag(null)} className="px-2 text-[#555] hover:text-[#888]">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div key={tag.id} className="flex items-center justify-between p-2 border border-[#1c1c1c] group hover:border-[#2a2a2a]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border border-[#2a2a2a]" style={{ backgroundColor: tag.color || '#c9a84c' }} />
                                                <span className="font-mono text-xs text-[#888]">{tag.name}</span>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingTag(tag)} className="p-1 text-[#555] hover:text-[#c9a84c]">
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteTag(tag.id)} className="p-1 text-[#555] hover:text-red-400">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-sm w-full">
                        <p className="font-mono text-xs text-[#c9a84c] mb-2">[ CONFIRM DELETE ]</p>
                        <p className="text-[#888] text-sm mb-4">This cannot be undone. The image file will be permanently deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 border border-[#2a2a2a] text-[#888] font-mono text-xs hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors">CANCEL</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 bg-red-900/20 border border-red-800/40 text-red-400 font-mono text-xs hover:bg-red-900/30 transition-colors">DELETE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
