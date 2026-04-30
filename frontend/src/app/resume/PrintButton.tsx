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
            className="btn-secondary"
        >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
        </button>
    );
}
