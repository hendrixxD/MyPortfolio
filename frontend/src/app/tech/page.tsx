import type { Metadata } from 'next';
import { getSkillsGrouped, getExperiences, getLearningSkills } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { Code2, Wrench, Database, Cloud, Cpu, BookOpen, Zap } from 'lucide-react';
import { TechBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Tech Profile',
    description: 'Explore my technical skills, tools, and expertise in data engineering, software development, and more.',
    openGraph: {
        title: 'Tech Profile | lengedandungjoshua',
        description: 'Technical skills, tools, and expertise in data engineering and software development.',
    },
};

export const revalidate = 60;

const categoryIcons: Record<string, any> = {
    'Programming Languages': Code2,
    'Data Engineering': Database,
    'Databases': Database,
    'Cloud & DevOps': Cloud,
    'Tools': Wrench,
    'Currently Learning': BookOpen,
};

export default async function TechPage() {
    const [skillsGrouped, experiences, learningSkills] = await Promise.all([
        getSkillsGrouped().catch(() => ({})),
        getExperiences('tech').catch(() => []),
        getLearningSkills().catch(() => []),
    ]);

    const categoryOrder = [
        'Programming Languages',
        'Data Engineering',
        'Databases',
        'Cloud & DevOps',
        'Tools',
    ];

    const sortedCategories = Object.keys(skillsGrouped).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <TechBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <Zap className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Tech <span className="gradient-text">Profile</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        A comprehensive overview of my technical skills, tools I work with, and technologies I'm passionate about.
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tech Profile
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            A comprehensive overview of my technical skills, tools I work with, and technologies I'm passionate about.
                        </p>
                    </div>

                    {/* Skills Matrix */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold mb-8">Skills Matrix</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedCategories.filter(cat => cat !== 'Currently Learning').map((category) => {
                                const Icon = categoryIcons[category] || Cpu;
                                const skills = skillsGrouped[category] || [];

                                return (
                                    <div key={category} className="card p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-semibold">{category}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {skills.map((skill) => (
                                                <div key={skill.id}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium">{skill.name}</span>
                                                        {skill.level && (
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                {skill.level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {skill.level_percent && (
                                                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${skill.level_percent}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* What I'm Learning */}
                    {learningSkills.length > 0 && (
                        <section className="mb-16">
                            <h2 className="text-2xl font-bold mb-8">What I'm Currently Learning</h2>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {learningSkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="card p-4 flex items-center gap-3 group hover:border-primary-500/50 transition-colors"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                                                <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{skill.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience Timeline */}
                    {experiences.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-8">Technical Experience</h2>

                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block" />

                                <div className="space-y-8">
                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="relative md:pl-12">
                                            {/* Timeline dot */}
                                            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-slate-900 hidden md:block" />

                                            <div className="card p-6">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{exp.role}</h3>
                                                        <p className="text-slate-600 dark:text-slate-400">
                                                            {exp.org_url ? (
                                                                <a
                                                                    href={exp.org_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-primary-600 dark:hover:text-primary-400"
                                                                >
                                                                    {exp.organization}
                                                                </a>
                                                            ) : (
                                                                exp.organization
                                                            )}
                                                            {exp.location && ` • ${exp.location}`}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                                    </span>
                                                </div>

                                                {exp.description && (
                                                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                        {exp.description}
                                                    </p>
                                                )}

                                                {exp.bullets?.length > 0 && (
                                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 mb-4">
                                                        {exp.bullets.map((bullet, idx) => (
                                                            <li key={idx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                                {exp.technologies?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {exp.technologies.map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
