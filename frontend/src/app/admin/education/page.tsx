'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getAllEducation, createEducation, updateEducation, deleteEducation } from '@/lib/api';
import type { Education } from '@/types';

const empty: Omit<Education, 'id' | 'created_at' | 'updated_at'> = {
    school: '', program: '', degree: null, department: null, location: null,
    start_date: null, end_date: null, is_current: false, description: null,
    achievements: null, gpa: null, order: 0, is_visible: true,
};

export default function AdminEducationPage() {
    const [items, setItems] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Education>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems(await getAllEducation()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setModal({ open: true, data: { ...empty }, id: null });
    const openEdit = (e: Education) => {
        // Ensure dates are in YYYY-MM-DD format for date inputs
        const data = { ...e };
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
    };
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updateEducation(modal.id, modal.data);
            else await createEducation(modal.data as Omit<Education, 'id' | 'created_at' | 'updated_at'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteEducation(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ EDUCATION ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD ENTRY
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO EDUCATION ENTRIES YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">SCHOOL / PROGRAM</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">PERIOD</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {items.map(edu => (
                                <tr key={edu.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8]">{edu.school}</p>
                                        <p className="font-mono text-[10px] text-[#555] mt-0.5">{edu.program}{edu.degree ? ` · ${edu.degree}` : ''}</p>
                                        {!edu.is_visible && <span className="font-mono text-[10px] text-[#444]">(hidden)</span>}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555]">
                                        {edu.start_date ?? '?'} – {edu.is_current ? 'Present' : (edu.end_date ?? '?')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(edu)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(edu.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT EDUCATION ]' : '[ NEW EDUCATION ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="School *"><input required value={modal.data.school ?? ''} onChange={e => set('school', e.target.value)} className="input-field" /></Field>
                                <Field label="Program *"><input required value={modal.data.program ?? ''} onChange={e => set('program', e.target.value)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Degree"><input value={modal.data.degree ?? ''} onChange={e => set('degree', e.target.value || null)} className="input-field" placeholder="e.g. B.Sc." /></Field>
                                <Field label="Department"><input value={modal.data.department ?? ''} onChange={e => set('department', e.target.value || null)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Location"><input value={modal.data.location ?? ''} onChange={e => set('location', e.target.value || null)} className="input-field" /></Field>
                                <Field label="GPA"><input value={modal.data.gpa ?? ''} onChange={e => set('gpa', e.target.value || null)} className="input-field" /></Field>
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
                            <Field label="Achievements"><textarea rows={2} value={modal.data.achievements ?? ''} onChange={e => set('achievements', e.target.value || null)} className="input-field resize-none" /></Field>
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
