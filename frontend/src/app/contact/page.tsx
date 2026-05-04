import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { ContactBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Contact',
    description: "Get in touch with lengedandungjoshua. I'm always open to discussing new projects, opportunities, or collaborations.",
    openGraph: {
        title: 'Contact | lengedandungjoshua',
        description: 'Get in touch with lengedandungjoshua for collaborations and opportunities.',
    },
};

const contactInfo = [
    {
        icon: Mail,
        label: 'EMAIL',
        value: 'lengedandungjoshua@gmail.com',
        href: 'mailto:lengedandungjoshua@gmail.com',
    },
    {
        icon: MapPin,
        label: 'LOCATION',
        value: 'Nigeria',
        href: null,
    },
];

const socialLinks = [
    {
        name: 'GitHub',
        handle: 'hendrixxD',
        href: 'https://github.com/hendrixxD',
        icon: Github,
        description: 'Open source projects',
    },
    {
        name: 'LinkedIn',
        handle: 'lenge-dandung-joshua',
        href: 'https://www.linkedin.com/in/lenge-dandung-joshua/',
        icon: Linkedin,
        description: 'Professional network',
    },
    {
        name: 'Twitter',
        handle: '@hendrixxjdl',
        href: 'https://x.com/hendrixxjdl',
        icon: Twitter,
        description: 'Tech insights',
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <ContactBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-10 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-4">
                        [ CONTACT ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] mb-3">
                        Get in Touch
                    </h1>
                    <p className="text-[#666] max-w-xl leading-relaxed">
                        Always open to discussing new projects, creative ideas, or opportunities
                        to be part of your visions.
                    </p>
                </div>
            </section>

            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-5 gap-12">

                    {/* ── Left: Info ── */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Direct contact */}
                        <div>
                            <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                                01 — DIRECT
                            </p>
                            <div className="space-y-0">
                                {contactInfo.map((info) => (
                                    <div
                                        key={info.label}
                                        className="flex items-start gap-5 py-4 border-b border-[#1c1c1c]"
                                    >
                                        <info.icon className="h-4 w-4 text-[#444] mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-mono text-[10px] tracking-[0.15em] text-[#444] mb-1">
                                                {info.label}
                                            </p>
                                            {info.href ? (
                                                <a
                                                    href={info.href}
                                                    className="text-sm text-[#e2d9c8] hover:text-[#c9a84c] transition-colors"
                                                >
                                                    {info.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-[#e2d9c8]">{info.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social */}
                        <div>
                            <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                                02 — SOCIAL
                            </p>
                            <div className="space-y-0">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-5 py-4 border-b border-[#1c1c1c] hover:bg-[#111] transition-colors group"
                                    >
                                        <link.icon className="h-4 w-4 text-[#444] group-hover:text-[#e2d9c8] transition-colors shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#e2d9c8] group-hover:text-white transition-colors font-medium">
                                                {link.name}
                                            </p>
                                            <p className="font-mono text-xs text-[#444]">{link.description}</p>
                                        </div>
                                        <span className="font-mono text-xs text-[#333] group-hover:text-[#c9a84c] transition-colors">
                                            →
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Form ── */}
                    <div className="lg:col-span-3">
                        <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                            03 — MESSAGE
                        </p>
                        <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-8">
                            <ContactForm />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
