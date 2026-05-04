'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getAllPublications, createPublication, updatePublication, deletePublication } from '@/lib/api';
import type { Publication } from '@/types';

const empty: Omit<Publication, 'id'> = {
    title: '', authors: [], venue: null, year: null, abstract: null,
    url: null, pdf_url: null, doi: null, publication_type: null, order: 0,
};

export default function AdminPublicationsPage() {
    const [items, setItems] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Publication>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [authorInput, setAuthorInput] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems(await getAllPublications()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setModal({ open: true, data: { ...empty, authors: [] }, id: null }); setAuthorInput(''); };
    const openEdit = (p: Publication) => { setModal({ open: true, data: { ...p, authors: [...p.authors] }, id: p.id }); setAuthorInput(''); };
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const addAuthor = () => { const v = authorInput.trim(); if (v) { set('authors', [...(modal.data.authors ?? []), v]); setAuthorInput(''); } };
    const removeAuthor = (i: number) => set('authors', (modal.data.authors ?? []).filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updatePublication(modal.id, modal.data);
            else await createPublication(modal.data as Omit<Publication, 'id'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deletePublication(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ PUBLICATIONS ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD PUBLICATION
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO PUBLICATIONS YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">TITLE</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">VENUE / YEAR</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden md:table-cell">TYPE</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {items.map(pub => (
                                <tr key={pub.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8] line-clamp-1">{pub.title}</p>
                                        <p className="font-mono text-[10px] text-[#444] mt-0.5 line-clamp-1">{pub.authors.join(', ')}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555]">
                                        {pub.venue ?? '—'}{pub.year ? `, ${pub.year}` : ''}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-[#555] capitalize">{pub.publication_type ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(pub)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(pub.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT PUBLICATION ]' : '[ NEW PUBLICATION ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Title *"><input required value={modal.data.title ?? ''} onChange={e => set('title', e.target.value)} className="input-field" /></Field>
                            <Field label="Authors">
                                <div className="flex gap-2 mb-2">
                                    <input value={authorInput} onChange={e => setAuthorInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAuthor(); } }} className="input-field flex-1 text-sm" placeholder="Author name" />
                                    <button type="button" onClick={addAuthor} className="p-2 border border-[#2a2a2a] text-[#444] hover:text-[#e2d9c8] hover:border-[#c9a84c]/40 transition-colors"><Plus className="h-4 w-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(modal.data.authors ?? []).map((a, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#2a2a2a] text-[#888] font-mono text-xs">
                                            {a}<button type="button" onClick={() => removeAuthor(i)} className="text-[#444] hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </Field>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Venue"><input value={modal.data.venue ?? ''} onChange={e => set('venue', e.target.value || null)} className="input-field" /></Field>
                                <Field label="Year"><input type="number" min={1900} max={2100} value={modal.data.year ?? ''} onChange={e => set('year', e.target.value ? +e.target.value : null)} className="input-field" /></Field>
                            </div>
                            <Field label="Type">
                                <select value={modal.data.publication_type ?? ''} onChange={e => set('publication_type', e.target.value || null)} className="input-field">
                                    <option value="">None</option>
                                    <option value="journal">Journal</option>
                                    <option value="conference">Conference</option>
                                    <option value="thesis">Thesis</option>
                                    <option value="preprint">Preprint</option>
                                    <option value="other">Other</option>
                                </select>
                            </Field>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="DOI"><input value={modal.data.doi ?? ''} onChange={e => set('doi', e.target.value || null)} className="input-field" /></Field>
                                <Field label="Order"><input type="number" value={modal.data.order ?? 0} onChange={e => set('order', +e.target.value)} className="input-field" /></Field>
                            </div>
                            <Field label="URL"><input value={modal.data.url ?? ''} onChange={e => set('url', e.target.value || null)} className="input-field" placeholder="https://..." /></Field>
                            <Field label="PDF URL"><input value={modal.data.pdf_url ?? ''} onChange={e => set('pdf_url', e.target.value || null)} className="input-field" placeholder="https://..." /></Field>
                            <Field label="Abstract"><textarea rows={4} value={modal.data.abstract ?? ''} onChange={e => set('abstract', e.target.value || null)} className="input-field resize-none" /></Field>
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
