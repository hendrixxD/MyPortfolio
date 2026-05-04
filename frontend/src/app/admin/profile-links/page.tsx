'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getAllProfileLinks, createProfileLink, updateProfileLink, deleteProfileLink } from '@/lib/api';
import type { ProfileLink } from '@/types';

const empty: Omit<ProfileLink, 'id'> = {
    platform: '', url: '', username: null, icon: null,
    description: null, is_visible: true, order: 0,
};

export default function AdminProfileLinksPage() {
    const [items, setItems] = useState<ProfileLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<ProfileLink>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems(await getAllProfileLinks()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setModal({ open: true, data: { ...empty }, id: null });
    const openEdit = (l: ProfileLink) => setModal({ open: true, data: { ...l }, id: l.id });
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updateProfileLink(modal.id, modal.data);
            else await createProfileLink(modal.data as Omit<ProfileLink, 'id'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteProfileLink(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ PROFILE LINKS ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD LINK
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO PROFILE LINKS YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">PLATFORM</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">URL</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden md:table-cell">STATUS</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {items.map(link => (
                                <tr key={link.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8]">{link.platform}</p>
                                        {link.username && <p className="font-mono text-[10px] text-[#444] mt-0.5">@{link.username}</p>}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[#c9a84c] hover:text-[#e2d9c8] transition-colors truncate max-w-xs block">{link.url}</a>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`font-mono text-[10px] px-1.5 py-0.5 border ${link.is_visible ? 'border-green-800/50 text-green-500' : 'border-[#2a2a2a] text-[#555]'}`}>
                                            {link.is_visible ? 'ACTIVE' : 'HIDDEN'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(link)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(link.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT LINK ]' : '[ NEW LINK ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Platform *"><input required value={modal.data.platform ?? ''} onChange={e => set('platform', e.target.value)} className="input-field" placeholder="e.g. GitHub, LinkedIn" /></Field>
                            <Field label="URL *"><input required value={modal.data.url ?? ''} onChange={e => set('url', e.target.value)} className="input-field" placeholder="https://..." /></Field>
                            <Field label="Username"><input value={modal.data.username ?? ''} onChange={e => set('username', e.target.value || null)} className="input-field" placeholder="@handle" /></Field>
                            <Field label="Icon"><input value={modal.data.icon ?? ''} onChange={e => set('icon', e.target.value || null)} className="input-field" /></Field>
                            <Field label="Description"><input value={modal.data.description ?? ''} onChange={e => set('description', e.target.value || null)} className="input-field" /></Field>
                            <Field label="Order"><input type="number" value={modal.data.order ?? 0} onChange={e => set('order', +e.target.value)} className="input-field" /></Field>
                            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                <input type="checkbox" checked={modal.data.is_visible ?? true} onChange={e => set('is_visible', e.target.checked)} /> Active / Visible
                            </label>
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
