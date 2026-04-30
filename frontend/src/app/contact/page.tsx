import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { Mail, MapPin, Github, Linkedin, Twitter, MessageSquare } from 'lucide-react';
import { ContactBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with lengedandungjoshua. I\'m always open to discussing new projects, opportunities, or collaborations.',
    openGraph: {
        title: 'Contact | lengedandungjoshua',
        description: 'Get in touch with lengedandungjoshua for collaborations and opportunities.',
    },
};

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'lengedandungjoshua@gmail.com',
        href: 'mailto:lengedandungjoshua@gmail.com',
    },
    {
        icon: MapPin,
        label: 'Location',
        value: 'Nigeria',
        href: null,
    },
];

const socialLinks = [
    {
        name: 'GitHub',
        href: 'https://github.com/hendrixxD',
        icon: Github,
        description: 'Check out my open source projects',
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/lenge-dandung-joshua/',
        icon: Linkedin,
        description: 'Connect with me professionally',
    },
    {
        name: 'Twitter',
        href: 'https://x.com/hendrixxjdl',
        icon: Twitter,
        description: 'Follow for tech insights',
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <ContactBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <MessageSquare className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                        Feel free to reach out!
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Get in Touch
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                                Feel free to reach out!
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-12">
                            {/* Contact Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                                    <div className="space-y-4">
                                        {contactInfo.map((info) => (
                                            <div key={info.label} className="flex items-start gap-4">
                                                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                                    <info.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{info.label}</p>
                                                    {info.href ? (
                                                        <a
                                                            href={info.href}
                                                            className="font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                        >
                                                            {info.value}
                                                        </a>
                                                    ) : (
                                                        <p className="font-medium text-slate-900 dark:text-slate-100">{info.value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Social Profiles</h2>
                                    <div className="space-y-3">
                                        {socialLinks.map((link) => (
                                            <a
                                                key={link.name}
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                            >
                                                <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm group-hover:shadow transition-shadow">
                                                    <link.icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{link.name}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{link.description}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-3">
                                <div className="card p-8">
                                    <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
                                    <ContactForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
