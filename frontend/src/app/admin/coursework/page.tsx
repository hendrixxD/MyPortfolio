'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { getCoursework, createCoursework, updateCoursework, deleteCoursework } from '@/lib/api';
import type { Coursework } from '@/types';

const empty: Omit<Coursework, 'id' | 'created_at' | 'updated_at'> = {
    course_name: '', institution: '', course_code: null, description: null,
    department: null, semester: null, year: null, credits: null, grade: null,
    category: null, instructor: null, topics_covered: null, skills_gained: null,
    syllabus_url: null, certificate_url: null, is_highlighted: false,
    order: 0, is_active: true,
};

export default function AdminCourseworkPage() {
    const [items, setItems] = useState<Coursework[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<{ open: boolean; data: Partial<Coursework>; id: number | null }>({ open: false, data: empty, id: null });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try { setItems(await getCoursework()); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => setModal({ open: true, data: { ...empty }, id: null });
    const openEdit = (c: Coursework) => setModal({ open: true, data: { ...c }, id: c.id });
    const closeModal = () => { setModal({ open: false, data: empty, id: null }); setError(''); };
    const set = (field: string, value: unknown) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            if (modal.id) await updateCoursework(modal.id, modal.data);
            else await createCoursework(modal.data as Omit<Coursework, 'id' | 'created_at' | 'updated_at'>);
            closeModal(); load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => { await deleteCoursework(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">[ COURSEWORK ]</p>
                <button onClick={openCreate} className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors">
                    <Plus className="h-3 w-3" /> ADD COURSE
                </button>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : items.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO COURSEWORK ENTRIES YET</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">COURSE</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">INSTITUTION</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden md:table-cell">YEAR / GRADE</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {items.map(c => (
                                <tr key={c.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8]">{c.course_name}</p>
                                        {c.course_code && <p className="font-mono text-[10px] text-[#444] mt-0.5">{c.course_code}</p>}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555]">{c.institution}</td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-[#555]">
                                        {c.year ?? '—'}{c.grade ? ` · ${c.grade}` : ''}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => setConfirmDelete(c.id)} className="p-1.5 text-[#444] hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                            <p className="font-mono text-xs text-[#c9a84c]">{modal.id ? '[ EDIT COURSE ]' : '[ NEW COURSE ]'}</p>
                            <button onClick={closeModal} className="text-[#444] hover:text-[#e2d9c8] transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Course Name *"><input required value={modal.data.course_name ?? ''} onChange={e => set('course_name', e.target.value)} className="input-field" /></Field>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Course Code"><input value={modal.data.course_code ?? ''} onChange={e => set('course_code', e.target.value || null)} className="input-field" /></Field>
                                <Field label="Institution *"><input required value={modal.data.institution ?? ''} onChange={e => set('institution', e.target.value)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-3">
                                <Field label="Year"><input type="number" min={2000} max={2100} value={modal.data.year ?? ''} onChange={e => set('year', e.target.value ? +e.target.value : null)} className="input-field" /></Field>
                                <Field label="Semester"><input value={modal.data.semester ?? ''} onChange={e => set('semester', e.target.value || null)} className="input-field" placeholder="Fall 2024" /></Field>
                                <Field label="Grade"><input value={modal.data.grade ?? ''} onChange={e => set('grade', e.target.value || null)} className="input-field" placeholder="A, 85%" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Department"><input value={modal.data.department ?? ''} onChange={e => set('department', e.target.value || null)} className="input-field" /></Field>
                                <Field label="Category"><input value={modal.data.category ?? ''} onChange={e => set('category', e.target.value || null)} className="input-field" /></Field>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field label="Instructor"><input value={modal.data.instructor ?? ''} onChange={e => set('instructor', e.target.value || null)} className="input-field" /></Field>
                                <Field label="Credits"><input type="number" min={0} value={modal.data.credits ?? ''} onChange={e => set('credits', e.target.value ? +e.target.value : null)} className="input-field" /></Field>
                            </div>
                            <Field label="Description"><textarea rows={2} value={modal.data.description ?? ''} onChange={e => set('description', e.target.value || null)} className="input-field resize-none" /></Field>
                            <Field label="Syllabus URL"><input value={modal.data.syllabus_url ?? ''} onChange={e => set('syllabus_url', e.target.value || null)} className="input-field" placeholder="https://..." /></Field>
                            <Field label="Certificate URL"><input value={modal.data.certificate_url ?? ''} onChange={e => set('certificate_url', e.target.value || null)} className="input-field" placeholder="https://..." /></Field>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                    <input type="checkbox" checked={modal.data.is_highlighted ?? false} onChange={e => set('is_highlighted', e.target.checked)} /> Highlighted
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                                    <input type="checkbox" checked={modal.data.is_active ?? true} onChange={e => set('is_active', e.target.checked)} /> Active
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
