'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getAllSkills, createSkill, updateSkill, deleteSkill } from '@/lib/api';
import type { Skill } from '@/types';

const empty: Omit<Skill, 'id' | 'created_at' | 'updated_at'> = {
    name: '', category: '', level: null, level_percent: null, icon: null,
    years_experience: null, is_learning: false, order: 0, is_visible: true,
};

export default function AdminSkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Skill>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setSkills(await getAllSkills()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setModal({ open: true, data: { ...empty }, id: null });
    const openEdit = (s: Skill) => setModal({ open: true, data: { ...s }, id: s.id });
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updateSkill(modal.id, modal.data);
            else await createSkill(modal.data as Omit<Skill, 'id' | 'created_at' | 'updated_at'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteSkill(id); setConfirmDelete(null); load(); };

    const categories = [...new Set(skills.map(s => s.category))].sort();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ SKILLS ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD SKILL
                </button>
            </div>

            {loading ? (
                <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
            ) : (
                <div className="space-y-4">
                    {categories.map(cat => (
                        <div key={cat} className="border border-[#1c1c1c] overflow-hidden">
                            <div className="px-4 py-2 bg-[#080808] border-b border-[#1c1c1c]">
                                <p className="font-mono text-[10px] tracking-[0.15em] text-[#555] uppercase">{cat}</p>
                            </div>
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-[#1c1c1c]">
                                    {skills.filter(s => s.category === cat).map(skill => (
                                        <tr key={skill.id} className="hover:bg-[#111] transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-[#e2d9c8]">{skill.name}</span>
                                                {skill.is_learning && <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 border border-blue-800/40 text-blue-400">LEARNING</span>}
                                                {!skill.is_visible && <span className="ml-2 font-mono text-[10px] text-[#444]">(hidden)</span>}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-[#555] hidden sm:table-cell capitalize">{skill.level ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-[#555] hidden md:table-cell">{skill.level_percent != null ? `${skill.level_percent}%` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(skill)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                                    <button onClick={() => setConfirmDelete(skill.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                    {skills.length === 0 && <div className="p-12 text-center font-mono text-xs text-[#444] border border-[#1c1c1c]">// NO SKILLS YET</div>}
                </div>
            )}

            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT SKILL ]' : '[ NEW SKILL ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Name *"><input required value={modal.data.name ?? ''} onChange={e => set('name', e.target.value)} className="input-field" /></Field>
                            <Field label="Category *"><input required value={modal.data.category ?? ''} onChange={e => set('category', e.target.value)} className="input-field" placeholder="e.g. Languages, Frameworks" /></Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Level">
                                    <select value={modal.data.level ?? ''} onChange={e => set('level', e.target.value || null)} className="input-field">
                                        <option value="">None</option>
                                        <option>beginner</option><option>intermediate</option><option>advanced</option><option>expert</option>
                                    </select>
                                </Field>
                                <Field label="Level %">
                                    <input type="number" min={0} max={100} value={modal.data.level_percent ?? ''} onChange={e => set('level_percent', e.target.value ? +e.target.value : null)} className="input-field" />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Years Exp">
                                    <input type="number" min={0} value={modal.data.years_experience ?? ''} onChange={e => set('years_experience', e.target.value ? +e.target.value : null)} className="input-field" />
                                </Field>
                                <Field label="Order">
                                    <input type="number" value={modal.data.order ?? 0} onChange={e => set('order', +e.target.value)} className="input-field" />
                                </Field>
                            </div>
                            <Field label="Icon"><input value={modal.data.icon ?? ''} onChange={e => set('icon', e.target.value || null)} className="input-field" /></Field>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                    <input type="checkbox" checked={modal.data.is_learning ?? false} onChange={e => set('is_learning', e.target.checked)} /> Currently learning
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                    <input type="checkbox" checked={modal.data.is_visible ?? true} onChange={e => set('is_visible', e.target.checked)} /> Visible
                                </label>
                            </div>
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
