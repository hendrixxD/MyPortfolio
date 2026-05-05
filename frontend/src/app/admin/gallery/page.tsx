'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Upload, Trash2, Copy, Check, ImageOff } from 'lucide-react';

interface GalleryImage {
    filename: string;
    url: string;
    size: number;
    uploaded_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/v1/upload/images`, { headers: authHeaders() });
            const data = await res.json();
            setImages(data.images || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadError('');

        const results = await Promise.allSettled(
            Array.from(files).map(async (file) => {
                const form = new FormData();
                form.append('file', file);
                const res = await fetch(`${API_URL}/api/v1/upload/image`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: form,
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Upload failed');
                }
                return res.json();
            })
        );

        const failed = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
        if (failed.length > 0) {
            setUploadError(failed.map(f => f.reason?.message).join(', '));
        }

        setUploading(false);
        load();
    };

    const handleDelete = async (filename: string) => {
        try {
            await fetch(`${API_URL}/api/v1/upload/image/${filename}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            setConfirmDelete(null);
            load();
        } catch (e) {
            console.error(e);
        }
    };

    const copyUrl = (url: string) => {
        const full = `${API_URL}${url}`;
        navigator.clipboard.writeText(full);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-0.5">[ GALLERY ]</p>
                    <span className="font-mono text-[10px] text-[#444]">{images.length} IMAGES</span>
                </div>
            </div>

            {/* Upload zone */}
            <div
                className={`border-2 border-dashed transition-colors mb-6 ${dragOver ? 'border-[#c9a84c]/60 bg-[#c9a84c]/5' : 'border-[#2a2a2a] hover:border-[#333]'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
            >
                <div className="p-10 flex flex-col items-center gap-3 text-center">
                    <Upload className={`h-8 w-8 ${dragOver ? 'text-[#c9a84c]' : 'text-[#333]'}`} />
                    <div>
                        <p className="font-mono text-xs text-[#888] mb-1">
                            {uploading ? 'UPLOADING...' : 'DRAG & DROP IMAGES HERE'}
                        </p>
                        <p className="font-mono text-[10px] text-[#444]">JPG, PNG, GIF, WEBP — max 10MB each</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="font-mono text-xs bg-[#c9a84c] text-[#080808] px-4 py-1.5 hover:bg-[#d4b56a] transition-colors disabled:opacity-50 mt-1"
                    >
                        {uploading ? 'UPLOADING...' : 'SELECT FILES'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => handleUpload(e.target.files)}
                    />
                </div>
            </div>

            {uploadError && (
                <div className="mb-4 p-3 border border-red-800/40 bg-red-900/10 font-mono text-xs text-red-400">
                    {uploadError}
                </div>
            )}

            {/* Image grid */}
            {loading ? (
                <div className="p-12 text-center font-mono text-xs text-[#444]">// LOADING</div>
            ) : images.length === 0 ? (
                <div className="p-12 text-center border border-[#1c1c1c]">
                    <ImageOff className="h-8 w-8 text-[#2a2a2a] mx-auto mb-3" />
                    <p className="font-mono text-xs text-[#444]">// NO IMAGES UPLOADED YET</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-[#1c1c1c]">
                    {images.map((img) => (
                        <div key={img.filename} className="bg-[#0f0f0f] group relative">
                            {/* Image */}
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={`${API_URL}${img.url}`}
                                    alt={img.filename}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => copyUrl(img.url)}
                                        title="Copy URL"
                                        className="p-1.5 border border-[#333] text-[#888] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-colors bg-[#0a0a0a]"
                                    >
                                        {copied === img.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(img.filename)}
                                        title="Delete"
                                        className="p-1.5 border border-red-800/40 text-red-400 hover:bg-red-900/20 transition-colors bg-[#0a0a0a]"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                                <div>
                                    <p className="font-mono text-[9px] text-[#888] truncate">{img.filename}</p>
                                    <p className="font-mono text-[9px] text-[#555]">{formatSize(img.size)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirm */}
            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-[#0d0d0d] border border-[#2a2a2a] p-6 max-w-sm w-full">
                        <p className="font-mono text-xs text-[#c9a84c] mb-2">[ CONFIRM DELETE ]</p>
                        <p className="font-mono text-[10px] text-[#555] mb-1 break-all">{confirmDelete}</p>
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
