'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, Github, Linkedin, Twitter } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles' },
    { name: 'Projects', href: '/projects' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Tech', href: '/tech' },
    { name: 'Academia', href: '/academia' },
    { name: 'Contact', href: '/contact' },
];

const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/hendrixxD', icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/lenge-dandung-joshua/', icon: Linkedin },
    { name: 'Twitter', href: 'https://x.com/hendrixxjdl', icon: Twitter },
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme, resolvedTheme, mounted } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full transition-all duration-300',
                isScrolled
                    ? 'bg-[#080808]/95 backdrop-blur-sm border-b border-[#1c1c1c]'
                    : 'bg-transparent'
            )}
        >
            <nav className="container-custom">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-xl font-bold"
                    >
                        <span className="text-[#e2d9c8] font-bold">lengedandungjoshua</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'px-3 py-2 text-sm font-medium transition-colors',
                                    pathname === item.href
                                        ? 'text-[#c9a84c] bg-[#0f0f0f] border border-[#1c1c1c]'
                                        : 'text-[#666] hover:text-[#e2d9c8] hover:bg-[#0f0f0f]'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-2">
                        {/* Social links - desktop only */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-[#555] hover:text-[#c9a84c] rounded-lg transition-colors"
                                    aria-label={link.name}
                                >
                                    <link.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>

                        {/* Theme toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-[#555] hover:text-[#e2d9c8] hover:bg-[#0f0f0f] transition-colors rounded-lg"
                                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {resolvedTheme === 'dark' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-[#555] hover:text-[#e2d9c8] transition-colors rounded-lg hover:bg-[#0f0f0f]"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden bg-[#080808] border-b border-[#1c1c1c]">
                        <div className="space-y-1 pb-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'block px-3 py-2 text-base font-medium transition-colors',
                                        pathname === item.href
                                            ? 'text-[#c9a84c] bg-[#0f0f0f] border-l border-[#c9a84c]'
                                            : 'text-[#666] hover:text-[#e2d9c8] hover:bg-[#0f0f0f]'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Social links - mobile */}
                            <div className="flex items-center space-x-2 px-3 pt-4 border-t border-[#1c1c1c] mt-4">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-[#555] hover:text-[#c9a84c] transition-colors"
                                        aria-label={link.name}
                                    >
                                        <link.icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
