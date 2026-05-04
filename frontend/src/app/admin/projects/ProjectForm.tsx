'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { getAdminProjectById, createProject, updateProject, getTags } from '@/lib/api';
import type { Tag } from '@/types';

interface Props {
    projectId: number | null;
    onSave: () => void;
    onCancel: () => void;
}

interface FormState {
    title: string;
    slug: string;
    summary: string;
    description_md: string;
    cover_image: string;
    repo_url: string;
    live_url: string;
    tech_tags: string[];
    category: string;
    status: string;
    featured: boolean;
    order: number;
    meta_title: string;
    meta_description: string;
    tag_ids: number[];
}

const empty: FormState = {
    title: '', slug: '', summary: '', description_md: '', cover_image: '',
    repo_url: '', live_url: '', tech_tags: [], category: '', status: 'draft',
    featured: false, order: 0, meta_title: '', meta_description: '', tag_ids: [],
};

export default function ProjectForm({ projectId, onSave, onCancel }: Props) {
    const [form, setForm] = useState<FormState>(empty);
    const [tags, setTags] = useState<Tag[]>([]);
    const [techInput, setTechInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const isEdit = projectId !== null;

    useEffect(() => {
        getTags('project').then(setTags).catch(console.error);
        if (isEdit && projectId) {
            getAdminProjectById(projectId).then(p => {
                setForm({
                    title: p.title, slug: p.slug, summary: p.summary ?? '',
                    description_md: p.description_md ?? '', cover_image: p.cover_image ?? '',
                    repo_url: p.repo_url ?? '', live_url: p.live_url ?? '',
                    tech_tags: p.tech_tags, category: p.category ?? '',
                    status: p.status, featured: p.featured, order: p.order,
                    meta_title: p.meta_title ?? '', meta_description: p.meta_description ?? '',
                    tag_ids: p.tags.map(t => t.id),
                });
            }).catch(console.error);
        }
    }, [projectId, isEdit]);

    const set = (field: keyof FormState, value: unknown) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const autoSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const addTech = () => {
        const v = techInput.trim();
        if (v && !form.tech_tags.includes(v)) set('tech_tags', [...form.tech_tags, v]);
        setTechInput('');
    };

    const removeTech = (t: string) => set('tech_tags', form.tech_tags.filter(x => x !== t));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                slug: form.slug || autoSlug(form.title),
                summary: form.summary || undefined,
                description_md: form.description_md || undefined,
                cover_image: form.cover_image || undefined,
                repo_url: form.repo_url || undefined,
                live_url: form.live_url || undefined,
                category: form.category || undefined,
                meta_title: form.meta_title || undefined,
                meta_description: form.meta_description || undefined,
            };
            if (isEdit && projectId) {
                await updateProject(projectId, payload);
            } else {
                await createProject(payload);
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
                    {isEdit ? 'Edit Project' : 'New Project'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <Field label="Title *">
                            <input required value={form.title} onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)); }} className="input-field" />
                        </Field>
                        <Field label="Slug">
                            <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input-field" />
                        </Field>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Repo URL">
                                <input value={form.repo_url} onChange={e => set('repo_url', e.target.value)} className="input-field" placeholder="https://github.com/..." />
                            </Field>
                            <Field label="Live URL">
                                <input value={form.live_url} onChange={e => set('live_url', e.target.value)} className="input-field" placeholder="https://..." />
                            </Field>
                        </div>
                        <Field label="Summary">
                            <textarea rows={2} value={form.summary} onChange={e => set('summary', e.target.value)} className="input-field resize-none" />
                        </Field>
                        <Field label="Description (Markdown)">
                            <textarea rows={16} value={form.description_md} onChange={e => set('description_md', e.target.value)} className="input-field resize-y font-mono text-sm" />
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

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
                        <Field label="Status">
                            <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </Field>
                        <Field label="Category">
                            <input value={form.category} onChange={e => set('category', e.target.value)} className="input-field" placeholder="e.g. web, mobile, ml" />
                        </Field>
                        <Field label="Display Order">
                            <input type="number" value={form.order} onChange={e => set('order', +e.target.value)} className="input-field" />
                        </Field>
                        <Field label="Cover Image URL">
                            <input value={form.cover_image} onChange={e => set('cover_image', e.target.value)} className="input-field" placeholder="https://..." />
                        </Field>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="rounded" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
                        </label>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tech Stack</h2>
                        <div className="flex gap-2 mb-3">
                            <input
                                value={techInput}
                                onChange={e => setTechInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                                className="input-field flex-1 text-sm"
                                placeholder="e.g. React"
                            />
                            <button type="button" onClick={addTech} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.tech_tags.map(t => (
                                <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
                                    {t}
                                    <button type="button" onClick={() => removeTech(t)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tags</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {tags.map(tag => (
                                <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.tag_ids.includes(tag.id)} onChange={e => set('tag_ids', e.target.checked ? [...form.tag_ids, tag.id] : form.tag_ids.filter(id => id !== tag.id))} className="rounded" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{tag.name}</span>
                                </label>
                            ))}
                            {tags.length === 0 && <p className="text-xs text-slate-400">No tags yet.</p>}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</p>}

                    <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-60">
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Project'}
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
