'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/lib/api';
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize';

export function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        // Sanitize inputs before submission
        const sanitizedData = {
            name: sanitizeText(formData.name),
            email: sanitizeEmail(formData.email),
            subject: sanitizeText(formData.subject),
            message: sanitizeText(formData.message),
        };

        // Validate sanitized data
        if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
            setStatus('error');
            setErrorMessage('Please fill in all required fields with valid data.');
            return;
        }

        try {
            await submitContactForm(sanitizedData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (status === 'success') {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="btn-secondary"
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Error sending message</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="label">
                        Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="Your name"
                        disabled={status === 'loading'}
                    />
                </div>

                <div>
                    <label htmlFor="email" className="label">
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="your@email.com"
                        disabled={status === 'loading'}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="subject" className="label">
                    Subject
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    placeholder="What's this about?"
                    disabled={status === 'loading'}
                />
            </div>

            <div>
                <label htmlFor="message" className="label">
                    Message *
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="textarea"
                    placeholder="Your message..."
                    disabled={status === 'loading'}
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full sm:w-auto"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </>
                )}
            </button>
        </form>
    );
}
