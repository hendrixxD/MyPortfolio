'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag } from '@/lib/api';
import type { Tag } from '@/types';

const empty = { name: '', slug: '', tag_type: 'article' as const, color: '#6366f1' };

export default function AdminTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Tag>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setTags(await getTags()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setModal({ open: true, data: { ...empty }, id: null });
    const openEdit = (t: Tag) => setModal({ open: true, data: { ...t }, id: t.id });
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const payload = { ...modal.data, slug: modal.data.slug || autoSlug(modal.data.name ?? '') };
            if (modal.id) await updateTag(modal.id, payload);
            else await createTag(payload as { name: string; slug?: string; tag_type: string; color?: string });
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteTag(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ TAGS ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD TAG
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : tags.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO TAGS YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">TAG</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">TYPE</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden md:table-cell">USAGE</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {tags.map(tag => (
                                <tr key={tag.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: tag.color }} />
                                            <span className="font-medium text-[#e2d9c8]">{tag.name}</span>
                                            <span className="font-mono text-[10px] text-[#444]">/{tag.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555] capitalize">{tag.tag_type}</td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-[10px] text-[#444]">
                                        {tag.article_count != null && `${tag.article_count} articles`}
                                        {tag.project_count != null && ` ${tag.project_count} projects`}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(tag)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(tag.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT TAG ]' : '[ NEW TAG ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Name *">
                                <input required value={modal.data.name ?? ''} onChange={e => { set('name', e.target.value); if (!modal.id) set('slug', autoSlug(e.target.value)); }} className="input-field" />
                            </Field>
                            <Field label="Slug">
                                <input value={modal.data.slug ?? ''} onChange={e => set('slug', e.target.value)} className="input-field" />
                            </Field>
                            <Field label="Type">
                                <select value={modal.data.tag_type ?? 'article'} onChange={e => set('tag_type', e.target.value)} className="input-field">
                                    <option value="article">Article</option>
                                    <option value="project">Project</option>
                                    <option value="both">Both</option>
                                </select>
                            </Field>
                            <Field label="Color">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={modal.data.color ?? '#6366f1'} onChange={e => set('color', e.target.value)} className="w-10 h-9 border border-[#2a2a2a] cursor-pointer bg-transparent" />
                                    <input value={modal.data.color ?? ''} onChange={e => set('color', e.target.value)} className="input-field flex-1" placeholder="#6366f1" />
                                </div>
                            </Field>
                        </div>
                        {error && <p className="font-mono text-xs text-red-400 mt-3">{error}</p>}
                        <div className="flex gap-3 mt-4">
                            <button onClick={closeModal} className="flex-1 px-4 py-2 border border-[#2a2a2a] text-[#888] font-mono text-xs hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors">CANCEL</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#c9a84c] text-[#080808] font-mono text-xs hover:bg-[#d4b56a] transition-colors disabled:opacity-60">
                                <Save className="h-3 w-3" />{saving ? 'SAVING...' : 'SAVE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-sm w-full">
                        <p className="font-mono text-xs text-[#c9a84c] mb-2">[ CONFIRM DELETE ]</p>
                        <p className="text-[#888] text-sm mb-4">This cannot be undone.</p>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block font-mono text-[10px] tracking-[0.1em] text-[#555] mb-1.5 uppercase">{label}</label>
            {children}
        </div>
    );
}
