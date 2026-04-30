import type { Metadata } from 'next';
import Link from 'next/link';
import { getEducation, getExperiences, getSkillsGrouped } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { Mail, MapPin, Github, Linkedin, FileText } from 'lucide-react';
import { PrintButton } from './PrintButton';
import { ResumeBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Resume',
    description: 'Resume/CV of lengedandungjoshua - Data Engineer and Chemical/Petroleum Technology professional.',
    openGraph: {
        title: 'Resume | lengedandungjoshua',
        description: 'Professional resume of lengedandungjoshua.',
    },
};

export const revalidate = 60;

export default async function ResumePage() {
    const [education, experiences, skillsGrouped] = await Promise.all([
        getEducation().catch(() => []),
        getExperiences().catch(() => []),
        getSkillsGrouped().catch(() => ({})),
    ]);

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <ResumeBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <FileText className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Resume</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-6">
                        My professional background, skills, and experience at a glance.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <PrintButton />
                    </div>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Resume Content */}
                    <div className="max-w-4xl mx-auto bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 shadow-xl rounded-xl overflow-hidden print:shadow-none print:bg-white">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-8 md:p-12">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">lengedandungjoshua</h1>
                            <p className="text-xl text-zinc-300 mb-6">
                                Data Engineer & Chemical/Petroleum Technology Professional
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <a
                                    href="mailto:lengedandungjoshua@gmail.com"
                                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    lengedandungjoshua@gmail.com
                                </a>
                                <span className="flex items-center gap-2 text-zinc-300">
                                    <MapPin className="h-4 w-4" />
                                    Nigeria
                                </span>
                                <a
                                    href="https://github.com/hendrixxD"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/lenge-dandung-joshua/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                                >
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </a>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 space-y-10">
                            {/* Summary */}
                            <section>
                                <h2 className="text-lg font-semibold text-primary-400 uppercase tracking-wider mb-4 border-b border-zinc-700 pb-2">
                                    Professional Summary
                                </h2>
                                <p className="text-zinc-300 leading-relaxed">
                                    Passionate Data Engineer with a strong foundation in Chemical and Petroleum Technology.
                                    Experienced in building scalable data pipelines, ETL processes, and data warehousing solutions.
                                    Combines technical expertise with scientific methodology to deliver data-driven insights.
                                    Strong background in laboratory analysis and quality control, with proven skills in
                                    technical writing and documentation.
                                </p>
                            </section>

                            {/* Experience */}
                            {experiences.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-semibold text-primary-400 uppercase tracking-wider mb-4 border-b border-zinc-700 pb-2">
                                        Experience
                                    </h2>
                                    <div className="space-y-6">
                                        {experiences.map((exp) => (
                                            <div key={exp.id}>
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-zinc-200">{exp.role}</h3>
                                                    <span className="text-sm text-zinc-500">
                                                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-400 mb-2">
                                                    {exp.organization}
                                                    {exp.location && ` • ${exp.location}`}
                                                </p>
                                                {exp.bullets?.length > 0 && (
                                                    <ul className="list-disc list-outside ml-5 space-y-1 text-zinc-300">
                                                        {exp.bullets.map((bullet, idx) => (
                                                            <li key={idx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-semibold text-primary-400 uppercase tracking-wider mb-4 border-b border-zinc-700 pb-2">
                                        Education
                                    </h2>
                                    <div className="space-y-4">
                                        {education.map((edu) => (
                                            <div key={edu.id}>
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-zinc-200">{edu.program}</h3>
                                                    <span className="text-sm text-zinc-500">
                                                        {formatDateRange(edu.start_date, edu.end_date, edu.is_current)}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-400">
                                                    {edu.school}
                                                    {edu.department && ` • ${edu.department}`}
                                                </p>
                                                {edu.achievements && (
                                                    <p className="text-sm text-primary-400 mt-1">
                                                        🏆 {edu.achievements}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Skills */}
                            {Object.keys(skillsGrouped).length > 0 && (
                                <section>
                                    <h2 className="text-lg font-semibold text-primary-400 uppercase tracking-wider mb-4 border-b border-zinc-700 pb-2">
                                        Skills
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {Object.entries(skillsGrouped).map(([category, skills]) => (
                                            <div key={category}>
                                                <h3 className="font-medium text-zinc-200 mb-2">
                                                    {category}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map((skill) => (
                                                        <span
                                                            key={skill.id}
                                                            className="px-2 py-1 text-sm bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
                                                        >
                                                            {skill.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="max-w-4xl mx-auto mt-8 text-center">
                        <p className="text-zinc-400 mb-4">
                            Interested in working together?
                        </p>
                        <Link href="/contact" className="btn-primary">
                            <Mail className="mr-2 h-4 w-4" />
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

