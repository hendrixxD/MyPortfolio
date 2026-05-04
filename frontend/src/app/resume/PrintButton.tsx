'use client';

import { Download } from 'lucide-react';

export function PrintButton() {
    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <button
            onClick={handlePrint}
            className="font-mono text-xs text-[#888] border border-[#333] px-3 py-1.5 flex items-center gap-2 hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-colors"
        >
            <Download className="h-3 w-3" />
            DOWNLOAD PDF
        </button>
    );
}
