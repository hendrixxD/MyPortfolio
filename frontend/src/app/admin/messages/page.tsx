'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mail, MailOpen, AlertTriangle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getContactMessages, markMessageAsRead, markMessageAsSpam, deleteContactMessage } from '@/lib/api';
import type { ContactMessage } from '@/types';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [includeSpam, setIncludeSpam] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getContactMessages({ page, page_size: 20, unread_only: unreadOnly, include_spam: includeSpam });
            setMessages(res.items);
            setTotal(res.total);
            setPages(res.pages);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, unreadOnly, includeSpam]);

    useEffect(() => { load(); }, [load]);

    const handleExpand = async (msg: ContactMessage) => {
        if (expanded === msg.id) { setExpanded(null); return; }
        setExpanded(msg.id);
        if (!msg.is_read) {
            await markMessageAsRead(msg.id);
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
        }
    };

    const handleSpam = async (id: number) => { await markMessageAsSpam(id); load(); };
    const handleDelete = async (id: number) => { await deleteContactMessage(id); setConfirmDelete(null); load(); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-0.5">[ MESSAGES ]</p>
                    <span className="font-mono text-[10px] text-[#444]">{total} TOTAL</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                    <input type="checkbox" checked={unreadOnly} onChange={e => { setUnreadOnly(e.target.checked); setPage(1); }} />
                    UNREAD ONLY
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#888]">
                    <input type="checkbox" checked={includeSpam} onChange={e => { setIncludeSpam(e.target.checked); setPage(1); }} />
                    INCLUDE SPAM
                </label>
            </div>

            <div className="space-y-px">
                {loading ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center font-mono text-xs text-[#444] border border-[#1c1c1c]">// NO MESSAGES FOUND</div>
                ) : messages.map(msg => (
                    <div key={msg.id} className={`border transition-colors ${msg.is_spam ? 'border-red-800/30' : 'border-[#1c1c1c]'} ${!msg.is_read && !msg.is_spam ? 'border-l-2 border-l-[#c9a84c]' : ''}`}>
                        <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#111] transition-colors"
                            onClick={() => handleExpand(msg)}
                        >
                            <div className="flex-shrink-0">
                                {msg.is_read
                                    ? <MailOpen className="h-4 w-4 text-[#444]" />
                                    : <Mail className="h-4 w-4 text-[#c9a84c]" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium text-sm ${!msg.is_read ? 'text-[#e2d9c8]' : 'text-[#666]'}`}>{msg.name}</span>
                                    <span className="font-mono text-[10px] text-[#444] hidden sm:inline">{msg.email}</span>
                                    {msg.is_spam && <span className="font-mono text-[10px] px-1.5 py-0.5 border border-red-800/40 text-red-400">SPAM</span>}
                                </div>
                                <p className="font-mono text-[10px] text-[#444] truncate">{msg.subject ?? msg.message.slice(0, 60)}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-mono text-[10px] text-[#444] hidden md:inline">
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </span>
                                {expanded === msg.id ? <ChevronUp className="h-4 w-4 text-[#444]" /> : <ChevronDown className="h-4 w-4 text-[#444]" />}
                            </div>
                        </div>

                        {expanded === msg.id && (
                            <div className="px-4 pb-4 border-t border-[#1c1c1c] pt-3">
                                <div className="grid sm:grid-cols-2 gap-2 mb-3 font-mono text-[10px] text-[#555]">
                                    <span><span className="text-[#888]">FROM:</span> {msg.name} &lt;{msg.email}&gt;</span>
                                    {msg.subject && <span><span className="text-[#888]">SUBJECT:</span> {msg.subject}</span>}
                                    <span><span className="text-[#888]">SENT:</span> {new Date(msg.created_at).toLocaleString()}</span>
                                    {msg.ip_address && <span><span className="text-[#888]">IP:</span> {msg.ip_address}</span>}
                                </div>
                                <p className="text-sm text-[#888] whitespace-pre-wrap bg-[#080808] border border-[#1c1c1c] p-3 mb-3 leading-relaxed">
                                    {msg.message}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <a
                                        href={`mailto:${msg.email}?subject=Re: ${msg.subject ?? 'Your message'}`}
                                        className="font-mono text-xs px-3 py-1.5 bg-[#c9a84c] text-[#080808] hover:bg-[#d4b56a] transition-colors"
                                    >
                                        REPLY
                                    </a>
                                    {!msg.is_spam && (
                                        <button onClick={() => handleSpam(msg.id)} className="flex items-center gap-1 font-mono text-xs px-3 py-1.5 border border-[#2a2a2a] text-[#888] hover:border-[#c9a84c]/40 hover:text-[#e2d9c8] transition-colors">
                                            <AlertTriangle className="h-3 w-3" /> MARK SPAM
                                        </button>
                                    )}
                                    <button onClick={() => setConfirmDelete(msg.id)} className="flex items-center gap-1 font-mono text-xs px-3 py-1.5 border border-red-800/40 text-red-400 hover:bg-red-900/20 transition-colors ml-auto">
                                        <Trash2 className="h-3 w-3" /> DELETE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
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
