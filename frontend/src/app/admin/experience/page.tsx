'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getAllExperiences, createExperience, updateExperience, deleteExperience } from '@/lib/api';
import type { Experience } from '@/types';

const empty: Omit<Experience, 'id' | 'created_at' | 'updated_at'> = {
    role: '', organization: '', org_url: null, location: null, employment_type: null,
    category: null, start_date: null, end_date: null, is_current: false,
    description: null, bullets: [], technologies: [], order: 0, is_visible: true,
};

export default function AdminExperiencePage() {
    const [items, setItems] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Experience>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [bulletInput, setBulletInput] = useState('');
    const [techInput, setTechInput] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems(await getAllExperiences()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setModal({ open: true, data: { ...empty }, id: null }); setBulletInput(''); setTechInput(''); };
    const openEdit = (e: Experience) => {
        // Ensure dates are in YYYY-MM-DD format for date inputs
        const data = { ...e, bullets: [...e.bullets], technologies: [...e.technologies] };
        // Normalize start_date
        if (data.start_date) {
            const startMatch = data.start_date.match(/^\d{4}(-\d{2})?(-\d{2})?$/);
            if (startMatch) {
                if (!startMatch[1]) {
                    data.start_date = data.start_date + '-01-01'; // Year only
                } else if (!startMatch[2]) {
                    data.start_date = data.start_date + '-01'; // Year-month only
                }
            } else {
                data.start_date = null; // Invalid format, clear it
            }
        }
        // Normalize end_date
        if (data.end_date) {
            const endMatch = data.end_date.match(/^\d{4}(-\d{2})?(-\d{2})?$/);
            if (endMatch) {
                if (!endMatch[1]) {
                    data.end_date = data.end_date + '-01-01'; // Year only
                } else if (!endMatch[2]) {
                    data.end_date = data.end_date + '-01'; // Year-month only
                }
            } else {
                data.end_date = null; // Invalid format, clear it
            }
        }
        setModal({ open: true, data, id: e.id });
        setBulletInput('');
        setTechInput('');
    };
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const addBullet = () => { const v = bulletInput.trim(); if (v) { set('bullets', [...(modal.data.bullets ?? []), v]); setBulletInput(''); } };
    const removeBullet = (i: number) => set('bullets', (modal.data.bullets ?? []).filter((_, idx) => idx !== i));
    const addTech = () => { const v = techInput.trim(); if (v && !(modal.data.technologies ?? []).includes(v)) { set('technologies', [...(modal.data.technologies ?? []), v]); setTechInput(''); } };
    const removeTech = (t: string) => set('technologies', (modal.data.technologies ?? []).filter(x => x !== t));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updateExperience(modal.id, modal.data);
            else await createExperience(modal.data as Omit<Experience, 'id' | 'created_at' | 'updated_at'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteExperience(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ EXPERIENCE ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD ENTRY
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO EXPERIENCE ENTRIES YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ROLE / ORGANIZATION</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">PERIOD</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden md:table-cell">CATEGORY</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {items.map(exp => (
                                <tr key={exp.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8]">{exp.role}</p>
                                        <p className="font-mono text-[10px] text-[#555] mt-0.5">{exp.organization}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555]">
                                        {exp.start_date ?? '?'} – {exp.is_current ? 'Present' : (exp.end_date ?? '?')}
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-[#555] capitalize">{exp.category ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(exp)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(exp.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT EXPERIENCE ]' : '[ NEW EXPERIENCE ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Role *"><input required value={modal.data.role ?? ''} onChange={e => set('role', e.target.value)} className="input-field" /></Field>
                                <Field label="Organization *"><input required value={modal.data.organization ?? ''} onChange={e => set('organization', e.target.value)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Org URL"><input value={modal.data.org_url ?? ''} onChange={e => set('org_url', e.target.value || null)} className="input-field" placeholder="https://..." /></Field>
                                <Field label="Location"><input value={modal.data.location ?? ''} onChange={e => set('location', e.target.value || null)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Employment Type"><input value={modal.data.employment_type ?? ''} onChange={e => set('employment_type', e.target.value || null)} className="input-field" placeholder="Full-time, Contract..." /></Field>
                                <Field label="Category">
                                    <select value={modal.data.category ?? ''} onChange={e => set('category', e.target.value || null)} className="input-field">
                                        <option value="">None</option>
                                        <option value="tech">Tech</option>
                                        <option value="academia">Academia</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Start Date">
                                    <input
                                        type="date"
                                        value={modal.data.start_date && typeof modal.data.start_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(modal.data.start_date) ? modal.data.start_date : ''}
                                        onChange={e => set('start_date', e.target.value || null)}
                                        className="input-field"
                                    />
                                </Field>
                                <Field label="End Date">
                                    <input
                                        type="date"
                                        value={modal.data.end_date && typeof modal.data.end_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(modal.data.end_date) ? modal.data.end_date : ''}
                                        onChange={e => set('end_date', e.target.value || null)}
                                        className="input-field"
                                        disabled={modal.data.is_current}
                                    />
                                </Field>
                            </div>
                            <Field label="Description"><textarea rows={3} value={modal.data.description ?? ''} onChange={e => set('description', e.target.value || null)} className="input-field resize-none" /></Field>

                            <Field label="Bullet Points">
                                <div className="flex gap-2 mb-2">
                                    <input value={bulletInput} onChange={e => setBulletInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBullet(); } }} className="input-field flex-1 text-sm" placeholder="Add a bullet point..." />
                                    <button type="button" onClick={addBullet} className="p-2 border border-[#2a2a2a] text-[#444] hover:text-[#e2d9c8] hover:border-[#c9a84c]/40 transition-colors"><Plus className="h-4 w-4" /></button>
                                </div>
                                <div className="space-y-1">
                                    {(modal.data.bullets ?? []).map((b, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-[#888] bg-[#080808] border border-[#1c1c1c] p-2">
                                            <span className="flex-1 font-mono text-xs">{b}</span>
                                            <button type="button" onClick={() => removeBullet(i)} className="text-[#444] hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </Field>

                            <Field label="Technologies">
                                <div className="flex gap-2 mb-2">
                                    <input value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} className="input-field flex-1 text-sm" placeholder="e.g. React" />
                                    <button type="button" onClick={addTech} className="p-2 border border-[#2a2a2a] text-[#444] hover:text-[#e2d9c8] hover:border-[#c9a84c]/40 transition-colors"><Plus className="h-4 w-4" /></button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(modal.data.technologies ?? []).map(t => (
                                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#2a2a2a] text-[#888] font-mono text-xs">
                                            {t}<button type="button" onClick={() => removeTech(t)} className="text-[#444] hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            </Field>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                    <input type="checkbox" checked={modal.data.is_current ?? false} onChange={e => set('is_current', e.target.checked)} /> Current
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
