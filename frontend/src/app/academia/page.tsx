import type { Metadata } from 'next';
import { getEducation, getPublications, getExperiences, getCourseworkGrouped } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { GraduationCap, BookOpen, Microscope, Award, ExternalLink, FileText, Library } from 'lucide-react';
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

    // Get category order for coursework
    const courseworkCategories = Object.keys(courseworkGrouped);

    return (
        <div className="min-h-screen relative">
            {/* Animated Background */}
            <AcademiaBackground />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="container-custom text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-6">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Academia</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        My academic journey in Chemical and Petroleum Technology, including education,
                        research interests, coursework, and publications.
                    </p>
                </div>
            </section>

            <div className="section-padding pt-0">
                <div className="container-custom">
                    {/* Header */}
                    <div className="max-w-3xl mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Academia
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            My academic journey in Chemical and Petroleum Technology, including education,
                            research interests, coursework, and publications.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Education */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Education</h2>
                                </div>

                                {education.length > 0 ? (
                                    <div className="space-y-6">
                                        {education.map((edu) => (
                                            <div key={edu.id} className="card p-6">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">{edu.program}</h3>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDateRange(edu.start_date, edu.end_date, edu.is_current)}
                                                    </span>
                                                </div>

                                                <p className="text-slate-600 dark:text-slate-400 mb-2">
                                                    {edu.school}
                                                    {edu.department && ` • ${edu.department}`}
                                                </p>

                                                {edu.location && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                        📍 {edu.location}
                                                    </p>
                                                )}

                                                {edu.description && (
                                                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                                                        {edu.description}
                                                    </p>
                                                )}

                                                {edu.achievements && (
                                                    <div className="flex items-start gap-2 text-sm text-primary-600 dark:text-primary-400">
                                                        <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                        <span>{edu.achievements}</span>
                                                    </div>
                                                )}

                                                {edu.gpa && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                                        GPA: {edu.gpa}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Education information coming soon.</p>
                                )}
                            </section>

                            {/* Lab/Research Experience */}
                            {experiences.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                                            <Microscope className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Laboratory & Research Experience</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {experiences.map((exp) => (
                                            <div key={exp.id} className="card p-6">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold">{exp.role}</h3>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                                    </span>
                                                </div>

                                                <p className="text-slate-600 dark:text-slate-400 mb-3">
                                                    {exp.organization}
                                                    {exp.location && ` • ${exp.location}`}
                                                </p>

                                                {exp.description && (
                                                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                                                        {exp.description}
                                                    </p>
                                                )}

                                                {exp.bullets?.length > 0 && (
                                                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
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

                            {/* Coursework Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <Library className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Coursework</h2>
                                </div>

                                {courseworkCategories.length > 0 ? (
                                    <div className="space-y-8">
                                        {courseworkCategories.map((category) => (
                                            <div key={category}>
                                                <h3 className="text-lg font-semibold text-zinc-300 mb-4 border-b border-zinc-700 pb-2">
                                                    {category}
                                                </h3>
                                                <div className="grid gap-4">
                                                    {courseworkGrouped[category].map((course) => (
                                                        <div key={course.id} className="card p-5 hover:border-emerald-500/50 transition-colors">
                                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {course.course_code && (
                                                                        <span className="px-2 py-0.5 text-xs font-mono bg-zinc-700 text-zinc-300 rounded">
                                                                            {course.course_code}
                                                                        </span>
                                                                    )}
                                                                    <h4 className="font-semibold">{course.course_name}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                                    {course.semester && <span>{course.semester}</span>}
                                                                    {course.year && <span>{course.year}</span>}
                                                                </div>
                                                            </div>

                                                            {course.description && (
                                                                <p className="text-sm text-zinc-400 mb-3">
                                                                    {course.description}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                                {course.credits && (
                                                                    <span className="text-zinc-500">
                                                                        {course.credits} Credits
                                                                    </span>
                                                                )}
                                                                {course.grade && (
                                                                    <span className="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 text-xs font-medium">
                                                                        Grade: {course.grade}
                                                                    </span>
                                                                )}
                                                                {course.instructor && (
                                                                    <span className="text-zinc-500">
                                                                        Instructor: {course.instructor}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {course.topics_covered && (
                                                                <div className="mt-3 pt-3 border-t border-zinc-700/50">
                                                                    <p className="text-xs text-zinc-500 mb-1">Topics Covered:</p>
                                                                    <p className="text-sm text-zinc-400">{course.topics_covered}</p>
                                                                </div>
                                                            )}

                                                            {(course.syllabus_url || course.certificate_url) && (
                                                                <div className="flex items-center gap-4 mt-3">
                                                                    {course.syllabus_url && (
                                                                        <a
                                                                            href={course.syllabus_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center text-xs text-emerald-400 hover:underline"
                                                                        >
                                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                                            Syllabus
                                                                        </a>
                                                                    )}
                                                                    {course.certificate_url && (
                                                                        <a
                                                                            href={course.certificate_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center text-xs text-emerald-400 hover:underline"
                                                                        >
                                                                            <Award className="h-3 w-3 mr-1" />
                                                                            Certificate
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
                                    <div className="card p-6 text-center">
                                        <Library className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                                        <p className="text-zinc-400">Coursework information coming soon.</p>
                                        <p className="text-sm text-zinc-500 mt-2">
                                            Check back later to see the courses I've taken during my academic journey.
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Publications */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Publications</h2>
                                </div>

                                {publications.length > 0 ? (
                                    <div className="space-y-4">
                                        {publications.map((pub) => (
                                            <div key={pub.id} className="card p-6">
                                                <h3 className="font-semibold mb-2">{pub.title}</h3>

                                                {pub.authors?.length > 0 && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        {pub.authors.join(', ')}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                                                    {pub.venue && <span>{pub.venue}</span>}
                                                    {pub.year && <span>• {pub.year}</span>}
                                                    {pub.publication_type && (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs capitalize">
                                                            {pub.publication_type}
                                                        </span>
                                                    )}
                                                </div>

                                                {pub.abstract && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
                                                        {pub.abstract}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    {pub.url && (
                                                        <a
                                                            href={pub.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-1" />
                                                            View Publication
                                                        </a>
                                                    )}
                                                    {pub.pdf_url && (
                                                        <a
                                                            href={pub.pdf_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            PDF
                                                        </a>
                                                    )}
                                                    {pub.doi && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            DOI: {pub.doi}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Publications coming soon.</p>
                                )}
                            </section>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Research Interests */}
                            <div className="card p-6">
                                <h3 className="font-semibold mb-4">Research Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {researchInterests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-3 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* CV Download */}
                            <div className="card p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
                                <h3 className="font-semibold mb-2">Download CV</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Get a comprehensive overview of my academic and professional background.
                                </p>
                                <a
                                    href="/resume"
                                    className="btn-primary w-full justify-center"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Resume
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
