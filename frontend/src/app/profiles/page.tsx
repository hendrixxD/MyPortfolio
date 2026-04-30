import type { Metadata } from 'next';
import { getProfileLinks } from '@/lib/api';
import { Github, Linkedin, Twitter, Mail, Globe, ExternalLink, Users } from 'lucide-react';
import { ProfilesBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Profiles',
    description: 'Connect with lengedandungjoshua on various platforms - GitHub, LinkedIn, Twitter, and more.',
    openGraph: {
        title: 'Profiles | lengedandungjoshua',
        description: 'Connect with lengedandungjoshua on various platforms.',
    },
};

export const revalidate = 60;

const iconMap: Record<string, any> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    mail: Mail,
    email: Mail,
    website: Globe,
};

function getIcon(platform: string, iconName: string | null) {
    if (iconName && iconMap[iconName.toLowerCase()]) {
        return iconMap[iconName.toLowerCase()];
    }
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('github')) return Github;
    if (platformLower.includes('linkedin')) return Linkedin;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return Twitter;
    if (platformLower.includes('mail') || platformLower.includes('email')) return Mail;
    return Globe;
}

export default async function ProfilesPage() {
    const profileLinks = await getProfileLinks().catch(() => []);

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <ProfilesBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <Users className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Profiles</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Find me across the web. Connect, follow, or reach out on any of these platforms.
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Profile Links Grid */}
                    {profileLinks.length > 0 ? (
                        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profileLinks.map((link) => {
                                const Icon = getIcon(link.platform, link.icon);

                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="card p-6 group hover:border-zinc-600 transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:from-zinc-600 group-hover:to-zinc-700 transition-colors">
                                                <Icon className="h-6 w-6 text-zinc-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                        {link.platform}
                                                    </h2>
                                                    <ExternalLink className="h-4 w-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                {link.username && (
                                                    <p className="text-sm text-zinc-500 truncate">
                                                        {link.username}
                                                    </p>
                                                )}
                                                {link.description && (
                                                    <p className="text-sm text-zinc-400 mt-2">
                                                        {link.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔗</div>
                            <p className="text-zinc-400">Profile links coming soon.</p>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="max-w-2xl mx-auto mt-16 text-center">
                        <div className="card p-8 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-zinc-700">
                            <h3 className="text-xl font-semibold mb-3 text-zinc-200">Prefer Email?</h3>
                            <p className="text-zinc-400 mb-4">
                                Feel free to reach out directly at{' '}
                                <a
                                    href="mailto:lengedandungjoshua@gmail.com"
                                    className="text-primary-400 hover:underline"
                                >
                                    lengedandungjoshua@gmail.com
                                </a>
                            </p>
                            <a
                                href="/contact"
                                className="btn-primary"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Send a Message
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

