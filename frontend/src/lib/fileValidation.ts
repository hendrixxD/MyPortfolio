/**
 * File upload validation utilities
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed MIME types for images
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];

// Allowed MIME types for documents
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'text/markdown',
    'text/plain',
];

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        };
    }

    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        };
    }

    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeExtensionMap: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/gif': ['gif'],
        'image/webp': ['webp'],
        'image/svg+xml': ['svg'],
    };

    const expectedExtensions = mimeExtensionMap[file.type];
    if (expectedExtensions && extension && !expectedExtensions.includes(extension)) {
        return {
            valid: false,
            error: 'File extension does not match file type',
        };
    }

    return { valid: true };
}

/**
 * Validate document file before upload
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`,
        };
    }

    return { valid: true };
}

/**
 * Validate file name for security
 */
export function validateFileName(fileName: string): { valid: boolean; error?: string } {
    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return {
            valid: false,
            error: 'Invalid characters in filename',
        };
    }

    // Check for suspicious extensions
    const suspiciousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
        '.vbs', '.js', '.jar', '.zip', '.rar', '.sh',
    ];

    const lowerFileName = fileName.toLowerCase();
    if (suspiciousExtensions.some(ext => lowerFileName.endsWith(ext))) {
        return {
            valid: false,
            error: 'File type not allowed for upload',
        };
    }

    // Check filename length
    if (fileName.length > 255) {
        return {
            valid: false,
            error: 'Filename too long (max 255 characters)',
        };
    }

    return { valid: true };
}

/**
 * Read file as data URL with validation
 */
export async function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to read file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Validate and prepare file for upload
 */
export async function prepareFileForUpload(
    file: File,
    type: 'image' | 'document' = 'image'
): Promise<{ valid: boolean; error?: string; data?: FormData }> {
    // Validate file name
    const nameValidation = validateFileName(file.name);
    if (!nameValidation.valid) {
        return nameValidation;
    }

    // Validate file content
    const validation = type === 'image'
        ? validateImageFile(file)
        : validateDocumentFile(file);

    if (!validation.valid) {
        return validation;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    return { valid: true, data: formData };
}
