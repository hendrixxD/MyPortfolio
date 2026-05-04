import type { Metadata } from 'next';
import { getSkillsGrouped, getExperiences, getLearningSkills } from '@/lib/api';
import { formatDateRange } from '@/lib/utils';
import { TechBackground } from '@/components/backgrounds/AnimatedBackgrounds';
import type { Skill, SkillsGrouped } from '@/types';

export const metadata: Metadata = {
    title: 'Technical Profile',
    description: 'Engineering at the intersection of data infrastructure and chemical/petroleum science — skills, stack, and field experience.',
    openGraph: {
        title: 'Technical Profile | lengedandungjoshua',
        description: 'Data engineering capabilities, technical stack, and field experience across chemical/petroleum and software domains.',
    },
};

export const revalidate = 60;

// Visual weight of a skill chip based on proficiency level
function skillChipWeight(level: string | null): { fontSize: string; fontWeight: string; opacity: string } {
    switch ((level || '').toLowerCase()) {
        case 'expert':
        case 'advanced':
            return { fontSize: 'text-sm', fontWeight: 'font-semibold', opacity: 'opacity-100' };
        case 'intermediate':
            return { fontSize: 'text-xs', fontWeight: 'font-medium', opacity: 'opacity-80' };
        case 'beginner':
        case 'learning':
        default:
            return { fontSize: 'text-[11px]', fontWeight: 'font-normal', opacity: 'opacity-50' };
    }
}

const categoryOrder = [
    'Programming Languages',
    'Data Engineering',
    'Databases',
    'Cloud & DevOps',
    'Tools',
];

// Map category to domain block label
const domainLabel: Record<string, string> = {
    'Programming Languages': 'LANGUAGES',
    'Data Engineering': 'DATA ENGINEERING',
    'Databases': 'DATABASES',
    'Cloud & DevOps': 'CLOUD & DEVOPS',
    'Tools': 'TOOLING',
};

export default async function TechPage() {
    const [skillsGrouped, experiences, learningSkills] = await Promise.all([
        getSkillsGrouped().catch(() => ({} as SkillsGrouped)),
        getExperiences('tech').catch(() => []),
        getLearningSkills().catch(() => []),
    ]);

    const sortedCategories = Object.keys(skillsGrouped)
        .filter((cat) => cat !== 'Currently Learning')
        .sort((a, b) => {
            const aIdx = categoryOrder.indexOf(a);
            const bIdx = categoryOrder.indexOf(b);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
        });

    const totalDomains = sortedCategories.length;
    const totalSkills = sortedCategories.reduce(
        (sum, cat) => sum + ((skillsGrouped[cat] as Skill[]) || []).length,
        0
    );

    return (
        <div className="min-h-screen relative text-[#e2d9c8]">
            <TechBackground />

            {/* ════════════════════════════════════════════
                HEADER — editorial statement
            ════════════════════════════════════════════ */}
            <section className="pt-24 pb-12 border-b border-[#1c1c1c]">
                <div className="container-custom">
                    <p className="font-mono text-xs tracking-[0.2em] text-[#c9a84c] mb-5">
                        [ TECHNICAL PROFILE ]
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e2d9c8] leading-tight mb-5">
                        Engineering at the<br />
                        <span className="text-[#3d7ab5]">intersection of data & science</span>
                    </h1>
                    {/* Inline key stats */}
                    <div className="flex flex-wrap gap-8 font-mono text-xs text-[#555]">
                        <span>
                            <span className="text-[#c9a84c] text-base font-bold mr-1.5">{totalDomains}</span>
                            DOMAINS
                        </span>
                        <span>
                            <span className="text-[#c9a84c] text-base font-bold mr-1.5">{totalSkills}</span>
                            SKILLS
                        </span>
                        {learningSkills.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{learningSkills.length}</span>
                                IN PROGRESS
                            </span>
                        )}
                        {experiences.length > 0 && (
                            <span>
                                <span className="text-[#c9a84c] text-base font-bold mr-1.5">{experiences.length}</span>
                                FIELD POSITIONS
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="container-custom">

                {/* ════════════════════════════════════════════
                    SECTION 1 — CAPABILITY MATRIX
                    2-column domain blocks, skill chips weighted by level
                ════════════════════════════════════════════ */}
                {sortedCategories.length > 0 && (
                    <section className="py-12 border-b border-[#1c1c1c]">
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                01 — CAPABILITY MATRIX
                            </h2>
                            <span className="text-[#2a2a2a] font-mono text-xs">
                                // proficiency conveyed by visual weight
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-px bg-[#1c1c1c]">
                            {sortedCategories.map((category) => {
                                const skills = (skillsGrouped[category] as Skill[]) || [];
                                return (
                                    <div
                                        key={category}
                                        className="bg-[#080808] p-6"
                                    >
                                        <p className="font-mono text-[11px] tracking-[0.15em] text-[#c9a84c] mb-4">
                                            {domainLabel[category] || category.toUpperCase()}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill: Skill) => {
                                                const w = skillChipWeight(skill.level);
                                                return (
                                                    <span
                                                        key={skill.id}
                                                        className={`${w.fontSize} ${w.fontWeight} ${w.opacity} text-[#e2d9c8] border border-[#222] px-2.5 py-1 font-mono`}
                                                        title={skill.level || undefined}
                                                    >
                                                        {skill.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════════
                    SECTION 2 — TECHNICAL STACK (tight chip grid)
                ════════════════════════════════════════════ */}
                {sortedCategories.length > 0 && (
                    <section className="py-12 border-b border-[#1c1c1c]">
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                02 — TECHNICAL STACK
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {sortedCategories.map((category) => {
                                const skills = (skillsGrouped[category] as Skill[]) || [];
                                return (
                                    <div key={category} className="flex flex-col sm:flex-row gap-4">
                                        <div className="sm:w-44 shrink-0">
                                            <p className="font-mono text-[10px] tracking-[0.12em] text-[#444] pt-1">
                                                {(domainLabel[category] || category).toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {skills.map((skill: Skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="font-mono text-xs border border-[#2a2a2a] text-[#888] px-2 py-0.5 hover:border-[#c9a84c]/25 hover:text-[#e2d9c8] transition-colors"
                                                >
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════════
                    SECTION 3 — CURRENTLY EXPLORING (terminal block)
                ════════════════════════════════════════════ */}
                {learningSkills.length > 0 && (
                    <section className="py-12 border-b border-[#1c1c1c]">
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                03 — CURRENTLY EXPLORING
                            </h2>
                        </div>

                        <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-5 font-mono text-sm max-w-lg">
                            {/* Terminal header bar */}
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1c1c1c]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                                <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                                <span className="text-[#444] text-[10px] ml-2 tracking-wider">
                                    ~/skills/in-progress
                                </span>
                            </div>
                            {learningSkills.map((skill: Skill) => (
                                <div key={skill.id} className="flex items-center gap-3 py-1">
                                    <span className="text-[#3d7ab5]">→</span>
                                    <span className="text-[#e2d9c8]">{skill.name.replace(/ /g, '_').toLowerCase()}</span>
                                    <span className="text-[#444] text-xs">[IN PROGRESS]</span>
                                </div>
                            ))}
                            {/* Blinking cursor via CSS animation */}
                            <div className="flex items-center gap-3 py-1">
                                <span className="text-[#3d7ab5]">→</span>
                                <span
                                    className="inline-block w-2 h-4 bg-[#c9a84c]"
                                    style={{ animation: 'blink 1.1s step-end infinite' }}
                                />
                            </div>
                        </div>

                        {/* Inline keyframe for cursor blink — Next.js allows inline styles in server components */}
                        <style>{`
                            @keyframes blink {
                                0%, 100% { opacity: 1; }
                                50% { opacity: 0; }
                            }
                        `}</style>
                    </section>
                )}

                {/* ════════════════════════════════════════════
                    SECTION 4 — FIELD EXPERIENCE (git-log style)
                ════════════════════════════════════════════ */}
                {experiences.length > 0 && (
                    <section className="py-12">
                        <div className="flex items-baseline gap-4 mb-8">
                            <h2 className="font-mono text-xs tracking-[0.2em] text-[#c9a84c]">
                                04 — FIELD EXPERIENCE
                            </h2>
                        </div>

                        <div className="relative">
                            {/* Vertical amber line */}
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/20" />

                            <div className="space-y-0">
                                {experiences.map((exp) => (
                                    <div
                                        key={exp.id}
                                        className="relative pl-7 py-7 border-b border-[#1c1c1c] last:border-b-0"
                                    >
                                        {/* Timeline node */}
                                        <div className="absolute left-[-3px] top-9 w-1.5 h-1.5 bg-[#c9a84c] rounded-full" />

                                        {/* Commit-log header */}
                                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                                            <span className="font-mono text-[11px] text-[#555]">
                                                {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                                            </span>
                                            <span className="text-[#2a2a2a] font-mono text-xs">|</span>
                                            <span className="font-semibold text-[#e2d9c8]">
                                                {exp.role}
                                            </span>
                                            <span className="text-[#444] font-mono text-xs">@</span>
                                            {exp.org_url ? (
                                                <a
                                                    href={exp.org_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#3d7ab5] hover:text-[#c9a84c] transition-colors font-medium"
                                                >
                                                    {exp.organization}
                                                </a>
                                            ) : (
                                                <span className="text-[#888]">{exp.organization}</span>
                                            )}
                                            {exp.location && (
                                                <>
                                                    <span className="text-[#2a2a2a] font-mono text-xs">|</span>
                                                    <span className="font-mono text-[11px] text-[#444]">
                                                        {exp.location}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {exp.description && (
                                            <p className="text-[#666] text-sm leading-relaxed mb-3">
                                                {exp.description}
                                            </p>
                                        )}

                                        {/* Bullets with ─ prefix */}
                                        {exp.bullets?.length > 0 && (
                                            <ul className="space-y-1 mb-4">
                                                {exp.bullets.map((bullet, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex gap-3 text-sm text-[#666] leading-relaxed"
                                                    >
                                                        <span className="text-[#333] font-mono shrink-0 mt-px">─</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Technology tags */}
                                        {exp.technologies?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {exp.technologies.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="font-mono text-[10px] border border-[#2a2a2a] text-[#555] px-2 py-0.5"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
