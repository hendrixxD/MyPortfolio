// User types
export interface User {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

// Tag types
export interface Tag {
    id: number;
    name: string;
    slug: string;
    type: 'article' | 'project' | 'both';
    color: string;
    article_count?: number;
    project_count?: number;
}

// Article types
export interface Article {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    content_md: string;
    cover_image: string | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    reading_time: number;
    view_count: number;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export interface ArticlePaginated {
    items: Article[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

// Project types
export interface Project {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    description_md: string | null;
    cover_image: string | null;
    screenshots: string[];
    repo_url: string | null;
    live_url: string | null;
    tech_tags: string[];
    category: string | null;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    display_order: number;
    meta_title: string | null;
    meta_description: string | null;
    tags: Tag[];
    created_at: string;
    updated_at: string;
}

export interface ProjectPaginated {
    items: Project[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

// Profile Link types
export interface ProfileLink {
    id: number;
    platform: string;
    url: string;
    username: string | null;
    icon: string | null;
    description: string | null;
    is_active: boolean;
    display_order: number;
}

// Education types
export interface Education {
    id: number;
    school: string;
    school_url: string | null;
    program: string;
    department: string | null;
    location: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    achievements: string | null;
    gpa: string | null;
    display_order: number;
}

// Experience types
export interface Experience {
    id: number;
    organization: string;
    org_url: string | null;
    role: string;
    location: string | null;
    category: 'tech' | 'academia' | 'other';
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    bullets: string[];
    technologies: string[];
    display_order: number;
}

// Skill types
export interface Skill {
    id: number;
    name: string;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
    level_percent: number | null;
    icon: string | null;
    is_learning: boolean;
    display_order: number;
}

export interface SkillsGrouped {
    [category: string]: Skill[];
}

// Publication types
export interface Publication {
    id: number;
    title: string;
    authors: string[];
    venue: string | null;
    year: number | null;
    abstract: string | null;
    url: string | null;
    pdf_url: string | null;
    doi: string | null;
    publication_type: 'journal' | 'conference' | 'thesis' | 'preprint' | 'other' | null;
    display_order: number;
}

// Coursework types
export interface Coursework {
    id: number;
    course_code: string | null;
    course_name: string;
    description: string | null;
    institution: string;
    department: string | null;
    semester: string | null;
    year: number | null;
    credits: number | null;
    grade: string | null;
    category: string | null;
    instructor: string | null;
    topics_covered: string | null;
    skills_gained: string | null;
    syllabus_url: string | null;
    certificate_url: string | null;
    is_highlighted: boolean;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CourseworkGrouped {
    [category: string]: Coursework[];
}

// Contact types
export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    is_spam: boolean;
    ip_address: string | null;
    created_at: string;
}

export interface ContactMessagePaginated {
    items: ContactMessage[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}

// Generic pagination type
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    pages: number;
}
