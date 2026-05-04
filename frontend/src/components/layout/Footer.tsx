'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tech', href: '/tech' },
    { name: 'Academia', href: '/academia' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
];

const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/hendrixxD', icon: Github, handle: 'hendrixxD' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/lenge-dandung-joshua/', icon: Linkedin, handle: 'lenge-dandung-joshua' },
    { name: 'Twitter', href: 'https://x.com/hendrixxjdl', icon: Twitter, handle: '@hendrixxjdl' },
    { name: 'Email', href: 'mailto:lengedandungjoshua@gmail.com', icon: Mail, handle: 'lengedandungjoshua@gmail.com' },
];

export function Footer() {
    return (
        <footer className="bg-[#080808] border-t border-[#1c1c1c]">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand + bio */}
                    <div>
                        <Link href="/" className="text-[#e2d9c8] font-bold text-lg">
                            lengedandungjoshua
                        </Link>
                        <p className="mt-3 text-[#555] text-sm leading-relaxed max-w-xs">
                            Data Engineer & Chemical/Petroleum Technology professional.
                            Building data pipelines at the intersection of technology and science.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#c9a84c] mb-4 uppercase">
                            Navigation
                        </p>
                        <ul className="space-y-2">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-[#666] hover:text-[#c9a84c] transition-colors font-mono text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-[#c9a84c] mb-4 uppercase">
                            Connect
                        </p>
                        <ul className="space-y-3">
                            {socialLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        target={link.href.startsWith('mailto') ? undefined : '_blank'}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-[#555] hover:text-[#c9a84c] transition-colors group"
                                    >
                                        <link.icon className="h-4 w-4 shrink-0" />
                                        <span className="font-mono text-xs">{link.handle}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-8 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="font-mono text-xs text-[#444]">
                        &copy; 2026 lengedandungjoshua
                    </p>
                    <p className="font-mono text-xs text-[#333]">
                        Data Engineer &middot; Chemical/Petroleum Technology
                    </p>
                </div>
            </div>
        </footer>
    );
}
