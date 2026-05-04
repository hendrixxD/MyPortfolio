'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { getAdminProjects, deleteProject, publishProject } from '@/lib/api';
import type { ProjectBrief } from '@/types';
import ProjectForm from './ProjectForm';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<ProjectBrief[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdminProjects({ page, page_size: 20, status: statusFilter || undefined });
            setProjects(res.items);
            setTotal(res.total);
            setPages(res.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: number) => { await deleteProject(id); setConfirmDelete(null); load(); };
    const handleTogglePublish = async (project: ProjectBrief) => { if (project.status !== 'published') await publishProject(project.id); load(); };

    if (showForm) {
        return (
            <ProjectForm
                projectId={editingId}
                onSave={() => { setShowForm(false); setEditingId(null); load(); }}
                onCancel={() => { setShowForm(false); setEditingId(null); }}
            />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-0.5">[ PROJECTS ]</p>
                    <span className="font-mono text-[10px] text-[#444]">{total} TOTAL</span>
                </div>
                <button
                    onClick={() => { setEditingId(null); setShowForm(true); }}
                    className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-3 py-1.5 flex items-center gap-2 hover:bg-[#d4b56a] transition-colors"
                >
                    <Plus className="h-3 w-3" /> NEW PROJECT
                </button>
            </div>

            <div className="mb-4">
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 font-mono text-xs border border-[#2a2a2a] bg-[#080808] text-[#e2d9c8] focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
                >
                    <option value="">ALL STATUS</option>
                    <option value="draft">DRAFT</option>
                    <option value="published">PUBLISHED</option>
                    <option value="archived">ARCHIVED</option>
                </select>
            </div>

            <div className="border border-[#1c1c1c] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : projects.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// NO PROJECTS FOUND</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-[#1c1c1c] bg-[#080808]">
                            <tr>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">TITLE</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">CATEGORY</th>
                                <th className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555] hidden sm:table-cell">STATUS</th>
                                <th className="text-right px-4 py-3 font-mono text-[10px] tracking-[0.1em] text-[#555]">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1c]">
                            {projects.map(project => (
                                <tr key={project.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-[#e2d9c8] line-clamp-1">{project.title}</p>
                                        <p className="font-mono text-[10px] text-[#444] mt-0.5 line-clamp-1">{project.tech_tags.join(', ')}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-[#555] capitalize">{project.category ?? '—'}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={project.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleTogglePublish(project)} title={project.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-[#444] hover:text-[#c9a84c] transition-colors">
                                                {project.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button onClick={() => { setEditingId(project.id); setShowForm(true); }} title="Edit" className="p-1.5 text-[#444] hover:text-[#e2d9c8] transition-colors">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => setConfirmDelete(project.id)} title="Delete" className="p-1.5 text-[#444] hover:text-red-400 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {pages > 1 && (
                <div className="flex items-center justify-between mt-4 font-mono text-xs">
                    <span className="text-[#444]">PAGE {page} OF {pages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-[#2a2a2a] text-[#888] disabled:opacity-40 hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors">PREV</button>
                        <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-[#2a2a2a] text-[#888] disabled:opacity-40 hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors">NEXT</button>
                    </div>
                </div>
            )}

            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-sm w-full">
                        <p className="font-mono text-xs text-[#c9a84c] mb-2">[ CONFIRM DELETE ]</p>
                        <p className="text-[#888] text-sm mb-4">This action cannot be undone.</p>
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

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        published: 'border-green-800/50 text-green-500',
        draft: 'border-[#c9a84c]/40 text-[#c9a84c]',
        archived: 'border-[#2a2a2a] text-[#555]',
    };
    return (
        <span className={`font-mono text-[10px] px-1.5 py-0.5 border uppercase tracking-wider ${styles[status] ?? styles.archived}`}>
            {status}
        </span>
    );
}
