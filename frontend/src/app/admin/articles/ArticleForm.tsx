'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Save, Upload, X, Link as LinkIcon } from 'lucide-react';
import { getAdminArticleById, createArticle, updateArticle, getTags, uploadImage } from '@/lib/api';
import type { Tag } from '@/types';

interface Props {
    articleId: number | null;
    onSave: () => void;
    onCancel: () => void;
}

interface FormState {
    title: string;
    slug: string;
    summary: string;
    content_md: string;
    cover_image: string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    reading_time: number;
    meta_title: string;
    meta_description: string;
    tag_ids: number[];
}

const empty: FormState = {
    title: '', slug: '', summary: '', content_md: '', cover_image: '',
    status: 'draft', featured: false, reading_time: 5,
    meta_title: '', meta_description: '', tag_ids: [],
};

export default function ArticleForm({ articleId, onSave, onCancel }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [tags, setTags] = useState<Tag[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [coverMode, setCoverMode] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEdit = articleId !== null;

    useEffect(() => {
        getTags('article').then(setTags).catch(console.error);
        if (isEdit && articleId) {
            getAdminArticleById(articleId).then(a => {
                setForm({
                    title: a.title,
                    slug: a.slug,
                    summary: a.summary ?? '',
                    content_md: a.content_md,
                    cover_image: a.cover_image ?? '',
                    status: a.status as 'draft' | 'published' | 'archived',
                    featured: a.featured,
                    reading_time: a.reading_time,
                    meta_title: a.meta_title ?? '',
                    meta_description: a.meta_description ?? '',
                    tag_ids: a.tags.map(t => t.id),
                });
                // If existing cover is a URL (not a local upload path), default to URL mode
                if (a.cover_image && !a.cover_image.startsWith('/uploads/')) {
                    setCoverMode('url');
                } else if (a.cover_image) {
                    setCoverMode('upload');
                }
            }).catch(console.error);
        }
    }, [articleId, isEdit]);

    const set = (field: keyof FormState, value: unknown) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const autoSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setUploadError('');
        try {
            const result = await uploadImage(file);
            set('cover_image', result.url);
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const clearCover = () => {
        set('cover_image', '');
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                slug: form.slug || autoSlug(form.title),
                summary: form.summary || undefined,
                cover_image: form.cover_image || undefined,
                meta_title: form.meta_title || undefined,
                meta_description: form.meta_description || undefined,
            };
            if (isEdit && articleId) {
                await updateArticle(articleId, payload);
            } else {
                await createArticle(payload);
            }
            onSave();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {isEdit ? 'Edit Article' : 'New Article'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <Field label="Title *">
                            <input
                                required
                                value={form.title}
                                onChange={e => {
                                    set('title', e.target.value);
                                    if (!isEdit) set('slug', autoSlug(e.target.value));
                                }}
                                className="input-field"
                            />
                        </Field>
                        <Field label="Slug">
                            <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input-field" />
                        </Field>
                        <Field label="Summary">
                            <textarea rows={2} value={form.summary} onChange={e => set('summary', e.target.value)} className="input-field resize-none" />
                        </Field>
                        <Field label="Content (Markdown) *">
                            <textarea
                                required
                                rows={20}
                                value={form.content_md}
                                onChange={e => set('content_md', e.target.value)}
                                className="input-field resize-y font-mono text-sm"
                                placeholder="Write your article in Markdown..."
                            />
                        </Field>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">SEO</h2>
                        <Field label="Meta Title">
                            <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} className="input-field" />
                        </Field>
                        <Field label="Meta Description">
                            <textarea rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} className="input-field resize-none" />
                        </Field>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
                        <Field label="Status">
                            <select value={form.status} onChange={e => set('status', e.target.value as 'draft' | 'published' | 'archived')} className="input-field">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </Field>
                        <Field label="Reading Time (min)">
                            <input type="number" min={1} value={form.reading_time} onChange={e => set('reading_time', +e.target.value)} className="input-field" />
                        </Field>

                        {/* Cover Image */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</label>
                                <div className="flex rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => { setCoverMode('upload'); clearCover(); }}
                                        className={`px-2 py-1 flex items-center gap-1 transition-colors ${coverMode === 'upload' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <Upload className="h-3 w-3" /> Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setCoverMode('url'); clearCover(); }}
                                        className={`px-2 py-1 flex items-center gap-1 transition-colors ${coverMode === 'url' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    >
                                        <LinkIcon className="h-3 w-3" /> URL
                                    </button>
                                </div>
                            </div>

                            {coverMode === 'url' ? (
                                <input
                                    value={form.cover_image}
                                    onChange={e => set('cover_image', e.target.value)}
                                    className="input-field"
                                    placeholder="https://..."
                                />
                            ) : (
                                <div>
                                    {form.cover_image ? (
                                        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.cover_image} alt="Cover preview" className="w-full h-32 object-cover" />
                                            <button
                                                type="button"
                                                onClick={clearCover}
                                                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={e => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                                                ${uploading
                                                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/10'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                                }`}
                                        >
                                            <Upload className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                                            {uploading ? (
                                                <p className="text-xs text-primary-600 dark:text-primary-400">Uploading...</p>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Drag & drop or click to upload</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF, WebP · max 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                    />
                                    {uploadError && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{uploadError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="rounded" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
                        </label>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tags</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {tags.map(tag => (
                                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.tag_ids.includes(tag.id)}
                                        onChange={e => set('tag_ids', e.target.checked
                                            ? [...form.tag_ids, tag.id]
                                            : form.tag_ids.filter(id => id !== tag.id)
                                        )}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{tag.name}</span>
                                </label>
                            ))}
                            {tags.length === 0 && <p className="text-xs text-slate-400">No tags yet.</p>}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</p>}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Article'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            {children}
        </div>
    );
}
