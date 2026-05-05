import type { Metadata } from 'next';
import type { SkillsGrouped } from '@/types';
import Link from 'next/link';
import { getEducation, getExperiences, getSkillsGrouped } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { Mail, MapPin, Github, Linkedin, Award } from 'lucide-react';
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

    const skillCategories = Object.keys(skillsGrouped);
    const totalSkills = skillCategories.reduce(
        (sum, cat) => sum + ((skillsGrouped as SkillsGrouped)[cat]?.length || 0),
        0,
    );

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <ResumeBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-12 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                        [ RESUME ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] leading-tight mb-2">
                        lengedandungjoshua
                    </h1>
                    <p className="text-[#888] text-lg mb-6">
                        Data Engineer &amp; Chemical/Petroleum Technology Professional
                    </p>

                    {/* Contact links */}
                    <div className="flex flex-wrap gap-5 font-mono text-xs text-[#555] mb-8">
                        <a
                            href="mailto:lengedandungjoshua@gmail.com"
                            className="flex items-center gap-1.5 hover:text-[#c9a84c] transition-colors"
                        >
                            <Mail className="h-3 w-3" />
                            lengedandungjoshua@gmail.com
                        </a>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            Nigeria
                        </span>
                        <a
                            href="https://github.com/hendrixxD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-[#c9a84c] transition-colors"
                        >
                            <Github className="h-3 w-3" />
                            GitHub
                        </a>
                        <a
                            href="https://www.linkedin.com/in/lenge-dandung-joshua/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-[#c9a84c] transition-colors"
                        >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                        </a>
                    </div>

                    {/* Inline stats */}
                    <div className="flex flex-wrap gap-8 font-mono text-xs text-[#555]">
                        {experiences.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{experiences.length}</span>
                                POSITIONS
                            </span>
                        )}
                        {education.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{education.length}</span>
                                DEGREES
                            </span>
                        )}
                        {totalSkills > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{totalSkills}</span>
                                SKILLS
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Print bar ── */}
            <section className="py-4 border-b border-[#1c1c1c]">
                <div className="container-custom flex items-center justify-between">
                    <p className="font-mono text-xs text-[#333]">// curriculum vitae</p>
                    <PrintButton />
                </div>
            </section>

            <div className="container-custom">
                <div className="max-w-3xl">

                    {/* ── 01 — Summary ── */}
                    <section className="py-10 border-b border-[#1c1c1c]">
                        <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-6">
                            01 — SUMMARY
                        </h2>
                        <p className="text-[#888] leading-relaxed">
                            Passionate Data Engineer with a strong foundation in Chemical and Petroleum Technology.
                            Experienced in building scalable data pipelines, ETL processes, and data warehousing solutions.
                            Combines technical expertise with scientific methodology to deliver data-driven insights.
                            Strong background in laboratory analysis and quality control, with proven skills in
                            technical writing and documentation.
                        </p>
                    </section>

                    {/* ── 02 — Experience ── */}
                    {experiences.length > 0 && (
                        <section className="py-10 border-b border-[#1c1c1c]">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-8">
                                02 — EXPERIENCE
                            </h2>

                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/20" />
                                <div className="space-y-0">
                                    {experiences.map((exp) => (
                                        <div
                                            key={exp.id}
                                            className="relative pl-7 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                        >
                                            <div className="absolute left-[-3px] top-9 w-1.5 h-1.5 bg-[#c9a84c] rounded-full" />

                                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                                                <span className="font-mono text-[11px] text-[#555]">
                                                    {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                                </span>
                                                <span className="text-[#2a2a2a] font-mono text-xs">|</span>
                                                <span className="font-semibold text-[#e2d9c8]">{exp.role}</span>
                                                <span className="text-[#444] font-mono text-xs">@</span>
                                                <span className="text-[#888]">{exp.organization}</span>
                                                {exp.location && (
                                                    <>
                                                        <span className="text-[#2a2a2a] font-mono text-xs">|</span>
                                                        <span className="font-mono text-[11px] text-[#444]">{exp.location}</span>
                                                    </>
                                                )}
                                            </div>

                                            {exp.description && (
                                                <p className="text-sm text-[#666] leading-relaxed mb-3 mt-2">
                                                    {exp.description}
                                                </p>
                                            )}

                                            {exp.bullets?.length > 0 && (
                                                <ul className="space-y-1.5 mt-2">
                                                    {exp.bullets.map((bullet: string, idx: number) => (
                                                        <li key={idx} className="flex gap-3 text-sm text-[#666] leading-relaxed">
                                                            <span className="text-[#333] font-mono shrink-0 mt-px">─</span>
                                                            <span>{bullet}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── 03 — Education ── */}
                    {education.length > 0 && (
                        <section className="py-10 border-b border-[#1c1c1c]">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-8">
                                03 — EDUCATION
                            </h2>

                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/20" />
                                <div className="space-y-0">
                                    {education.map((edu) => (
                                        <div
                                            key={edu.id}
                                            className="relative pl-7 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                        >
                                            <div className="absolute left-[-3px] top-9 w-1.5 h-1.5 bg-[#c9a84c] rounded-full" />

                                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                                                <span className="font-mono text-[11px] text-[#555]">
                                                    {formatDateRange(edu.start_date, edu.end_date, edu.is_current)}
                                                </span>
                                                <span className="text-[#2a2a2a] font-mono text-xs">|</span>
                                                <span className="font-semibold text-[#e2d9c8]">{edu.program}</span>
                                            </div>

                                            <p className="text-sm text-[#888] mb-1">
                                                {edu.school}{edu.department && ` · ${edu.department}`}
                                            </p>

                                            {edu.location && (
                                                <p className="font-mono text-[11px] text-[#444] mb-2">{edu.location}</p>
                                            )}

                                            {edu.description && (
                                                <p className="text-sm text-[#666] leading-relaxed mb-2">
                                                    {edu.description}
                                                </p>
                                            )}

                                            {edu.achievements && (
                                                <div className="flex items-start gap-2 text-sm text-[#c9a84c] mt-2">
                                                    <Award className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                    <span className="text-xs">{edu.achievements}</span>
                                                </div>
                                            )}

                                            {edu.gpa && (
                                                <p className="font-mono text-[11px] text-[#444] mt-1">GPA: {edu.gpa}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── 04 — Skills ── */}
                    {skillCategories.length > 0 && (
                        <section className="py-10 border-b border-[#1c1c1c]">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-8">
                                04 — SKILLS
                            </h2>

                            <div className="space-y-8">
                                {skillCategories.map((category) => (
                                    <div key={category}>
                                        <p className="font-mono text-[11px] tracking-[0.15em] text-[#555] mb-3 pb-2 border-b border-[#1c1c1c]">
                                            {category.toUpperCase()}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {((skillsGrouped as SkillsGrouped)[category] || []).map((skill: { id: number; name: string }) => (
                                                <span
                                                    key={skill.id}
                                                    className="font-mono text-xs border border-[#2a2a2a] text-[#888] px-2.5 py-1 hover:border-[#c9a84c]/25 hover:text-[#e2d9c8] transition-colors"
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

                    {/* ── CTA ── */}
                    <div className="py-10">
                        <p className="font-mono text-xs text-[#444] mb-3">// interested in working together?</p>
                        <Link
                            href="/contact"
                            className="font-mono text-sm text-[#e2d9c8] hover:text-[#c9a84c] transition-colors flex items-center gap-2 w-fit"
                        >
                            <Mail className="h-3.5 w-3.5" />
                            GET IN TOUCH →
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
