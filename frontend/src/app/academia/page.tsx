import type { Metadata } from 'next';
import { getEducation, getPublications, getExperiences, getCourseworkGrouped } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { ExternalLink, FileText, Award } from 'lucide-react';
import { AcademiaBackground } from '@/components/backgrounds/AnimatedBackgrounds';

export const metadata: Metadata = {
    title: 'Academia',
    description: 'Academic background, publications, coursework, and research interests of lengedandungjoshua in Chemical/Petroleum Technology.',
    openGraph: {
        title: 'Academia | lengedandungjoshua',
        description: 'Academic background, publications, coursework, and research in Chemical/Petroleum Technology.',
    },
};

export const revalidate = 60;

export default async function AcademiaPage() {
    const [education, publications, experiences, courseworkGrouped] = await Promise.all([
        getEducation().catch(() => []),
        getPublications().catch(() => []),
        getExperiences('academia').catch(() => []),
        getCourseworkGrouped().catch(() => ({})),
    ]);

    const researchInterests = [
        'Crude Oil Quality Analysis',
        'Spectroscopic Methods in Petroleum',
        'Data-Driven Laboratory Automation',
        'Process Optimization',
        'Quality Control Systems',
    ];

    const courseworkCategories = Object.keys(courseworkGrouped);

    const totalCredits = courseworkCategories.reduce((sum, cat) => {
        return sum + courseworkGrouped[cat].reduce((s: number, c: { credits?: number }) => s + (c.credits || 0), 0);
    }, 0);

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <AcademiaBackground />

            {/* ── Hero ── */}
            <section className="pt-24 pb-12 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                        [ ACADEMIA ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] leading-tight mb-5">
                        Academic Record
                    </h1>
                    {/* Inline stats */}
                    <div className="flex flex-wrap gap-8 font-mono text-xs text-[#555]">
                        {education.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{education.length}</span>
                                DEGREES
                            </span>
                        )}
                        {publications.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{publications.length}</span>
                                PUBLICATIONS
                            </span>
                        )}
                        {experiences.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{experiences.length}</span>
                                LAB POSITIONS
                            </span>
                        )}
                        {totalCredits > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{totalCredits}</span>
                                CREDITS
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="container-custom">
                <div className="grid lg:grid-cols-3 gap-0">

                    {/* ── Main content ── */}
                    <div className="lg:col-span-2 lg:border-r lg:border-[#1c1c1c]">

                        {/* ── 01 — Education ── */}
                        <section className="py-12 border-b border-[#1c1c1c] lg:pr-12">
                            <div className="flex items-baseline gap-4 mb-8">
                                <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                    01 — EDUCATION
                                </h2>
                            </div>

                            {education.length > 0 ? (
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/20" />
                                    <div className="space-y-0">
                                        {education.map((edu) => (
                                            <div
                                                key={edu.id}
                                                className="relative pl-7 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                            >
                                                <div className="absolute left-[-3px] top-9 w-1.5 h-1.5 bg-[#c9a84c] rounded-full" />

                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
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
                                                    <div className="flex items-start gap-2 text-sm text-[#c9a84c]">
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
                            ) : (
                                <p className="font-mono text-xs text-[#444]">// COMING SOON</p>
                            )}
                        </section>

                        {/* ── 02 — Lab & Research ── */}
                        {experiences.length > 0 && (
                            <section className="py-12 border-b border-[#1c1c1c] lg:pr-12">
                                <div className="flex items-baseline gap-4 mb-8">
                                    <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                        02 — LAB &amp; RESEARCH
                                    </h2>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-[#3d7ab5]/20" />
                                    <div className="space-y-0">
                                        {experiences.map((exp) => (
                                            <div
                                                key={exp.id}
                                                className="relative pl-7 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                            >
                                                <div className="absolute left-[-3px] top-9 w-1.5 h-1.5 bg-[#3d7ab5] rounded-full" />

                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
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
                                                    <p className="text-sm text-[#666] leading-relaxed mb-2">
                                                        {exp.description}
                                                    </p>
                                                )}

                                                {exp.bullets?.length > 0 && (
                                                    <ul className="space-y-1">
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

                        {/* ── 03 — Coursework ── */}
                        <section className="py-12 border-b border-[#1c1c1c] lg:pr-12">
                            <div className="flex items-baseline gap-4 mb-8">
                                <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                    03 — COURSEWORK
                                </h2>
                            </div>

                            {courseworkCategories.length > 0 ? (
                                <div className="space-y-10">
                                    {courseworkCategories.map((category) => (
                                        <div key={category}>
                                            <p className="font-mono text-[11px] tracking-[0.15em] text-[#c9a84c] mb-4 pb-2 border-b border-[#1c1c1c]">
                                                {category.toUpperCase()}
                                            </p>
                                            <div className="space-y-0">
                                                {courseworkGrouped[category].map((course: {
                                                    id: number;
                                                    course_code?: string;
                                                    course_name: string;
                                                    semester?: string;
                                                    year?: string;
                                                    description?: string;
                                                    credits?: number;
                                                    grade?: string;
                                                    instructor?: string;
                                                    topics_covered?: string;
                                                    syllabus_url?: string;
                                                    certificate_url?: string;
                                                }) => (
                                                    <div
                                                        key={course.id}
                                                        className="py-5 border-b border-[#1c1c1c] last:border-b-0"
                                                    >
                                                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-3">
                                                                {course.course_code && (
                                                                    <span className="font-mono text-xs bg-[#111] border border-[#2a2a2a] text-[#888] px-1.5 py-0.5">
                                                                        {course.course_code}
                                                                    </span>
                                                                )}
                                                                <h4 className="font-semibold text-[#e2d9c8] text-sm">
                                                                    {course.course_name}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-3 font-mono text-[11px] text-[#444]">
                                                                {course.semester && <span>{course.semester}</span>}
                                                                {course.year && <span>{course.year}</span>}
                                                            </div>
                                                        </div>

                                                        {course.description && (
                                                            <p className="text-sm text-[#555] mb-2 leading-relaxed">
                                                                {course.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#444]">
                                                            {course.credits && (
                                                                <span>{course.credits} credits</span>
                                                            )}
                                                            {course.grade && (
                                                                <span
                                                                    className="px-1.5 py-0.5 border border-[#2a2a2a] text-[#c9a84c]"
                                                                >
                                                                    {course.grade}
                                                                </span>
                                                            )}
                                                            {course.instructor && (
                                                                <span className="text-[#333]">{course.instructor}</span>
                                                            )}
                                                        </div>

                                                        {course.topics_covered && (
                                                            <p className="text-xs text-[#444] mt-2 pt-2 border-t border-[#1c1c1c]">
                                                                {course.topics_covered}
                                                            </p>
                                                        )}

                                                        {(course.syllabus_url || course.certificate_url) && (
                                                            <div className="flex items-center gap-5 mt-2">
                                                                {course.syllabus_url && (
                                                                    <a
                                                                        href={course.syllabus_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-mono text-xs text-[#3d7ab5] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3" />
                                                                        SYLLABUS
                                                                    </a>
                                                                )}
                                                                {course.certificate_url && (
                                                                    <a
                                                                        href={course.certificate_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="font-mono text-xs text-[#3d7ab5] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Award className="h-3 w-3" />
                                                                        CERTIFICATE
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs text-[#444]">// COMING SOON</p>
                            )}
                        </section>

                        {/* ── 04 — Publications ── */}
                        <section className="py-12 lg:pr-12">
                            <div className="flex items-baseline gap-4 mb-8">
                                <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                    04 — PUBLICATIONS
                                </h2>
                            </div>

                            {publications.length > 0 ? (
                                <div className="space-y-0">
                                    {publications.map((pub, i) => (
                                        <div
                                            key={pub.id}
                                            className="flex gap-6 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                        >
                                            <span className="font-mono text-sm text-[#c9a84c] opacity-50 shrink-0 w-7 text-right mt-0.5">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#e2d9c8] mb-2">{pub.title}</h3>

                                                {pub.authors?.length > 0 && (
                                                    <p className="text-xs text-[#555] mb-2">{pub.authors.join(', ')}</p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#444] mb-2">
                                                    {pub.venue && <span>{pub.venue}</span>}
                                                    {pub.year && <span>· {pub.year}</span>}
                                                    {pub.publication_type && (
                                                        <span className="border border-[#2a2a2a] px-1.5 py-0.5 text-[#555]">
                                                            {pub.publication_type.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>

                                                {pub.abstract && (
                                                    <p className="text-sm text-[#555] line-clamp-3 mb-3 leading-relaxed">
                                                        {pub.abstract}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-5">
                                                    {pub.url && (
                                                        <a
                                                            href={pub.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-xs text-[#3d7ab5] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            VIEW
                                                        </a>
                                                    )}
                                                    {pub.pdf_url && (
                                                        <a
                                                            href={pub.pdf_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-xs text-[#3d7ab5] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            PDF
                                                        </a>
                                                    )}
                                                    {pub.doi && (
                                                        <span className="font-mono text-xs text-[#333]">
                                                            DOI: {pub.doi}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-mono text-xs text-[#444]">// COMING SOON</p>
                            )}
                        </section>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:pl-12 py-12 space-y-10">

                        {/* Research Interests */}
                        <div>
                            <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                                RESEARCH INTERESTS
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {researchInterests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="font-mono text-xs border border-[#2a2a2a] text-[#888] px-2.5 py-1 hover:border-[#c9a84c]/25 hover:text-[#e2d9c8] transition-colors"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CV */}
                        <div className="border-t border-[#1c1c1c] pt-8">
                            <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-3">
                                CURRICULUM VITAE
                            </p>
                            <p className="text-sm text-[#555] mb-4 leading-relaxed">
                                Comprehensive overview of academic and professional background.
                            </p>
                            <a
                                href="/resume"
                                className="font-mono text-sm text-[#e2d9c8] hover:text-[#c9a84c] transition-colors flex items-center gap-2"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                VIEW RESUME →
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
