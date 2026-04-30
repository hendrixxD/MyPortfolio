'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

const navigation = {
    main: [
        { name: 'Home', href: '/' },
        { name: 'Articles', href: '/articles' },
        { name: 'Projects', href: '/projects' },
        { name: 'Contact', href: '/contact' },
    ],
    secondary: [
        { name: 'Tech Profile', href: '/tech' },
        { name: 'Academia', href: '/academia' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Resume', href: '/resume' },
        { name: 'Profiles', href: '/profiles' },
    ],
    social: [
        { name: 'GitHub', href: 'https://github.com/hendrixxD', icon: Github },
        { name: 'LinkedIn', href: 'https://www.linkedin.com/in/lenge-dandung-joshua/', icon: Linkedin },
        { name: 'Twitter', href: 'https://x.com/hendrixxjdl', icon: Twitter },
        { name: 'Email', href: 'mailto:lengedandungjoshua@gmail.com', icon: Mail },
    ],
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="text-xl font-bold gradient-text">
                            lengedandungjoshua
                        </Link>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-md">
                            Data Engineer & Chemical/Petroleum Technology professional. Building data pipelines
                            and exploring the intersection of technology and science.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center space-x-3 mt-6">
                            {navigation.social.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-md"
                                    aria-label={item.name}
                                >
                                    <item.icon className="h-5 w-5 transition-transform duration-300" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-2">
                            {navigation.main.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* More Links */}
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                            More
                        </h3>
                        <ul className="space-y-2">
                            {navigation.secondary.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center">
                            © {currentYear} lengedandungjoshua. Made with
                            <Heart className="h-4 w-4 mx-1 text-red-500 animate-pulse" aria-label="love" />
                            and lots of coffee.
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-500">
                            <Link href="/admin-login" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                Admin
                            </Link>
                            <span>•</span>
                            <a href="/rss.xml" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                RSS
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
