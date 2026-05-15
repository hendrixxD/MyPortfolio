import type {
    Article,
    ArticleBrief,
    ArticlePaginated,
    Project,
    ProjectBrief,
    ProjectPaginated,
    Tag,
    ProfileLink,
    Education,
    Experience,
    Skill,
    Publication,
    Coursework,
    ContactMessage,
    ContactMessagePaginated,
    User,
    LoginResponse,
    GalleryItem,
    GalleryItemBrief,
    GalleryTag,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Always include cookies for authentication
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new ApiError(error.detail || 'Request failed', response.status);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
}

// Deprecated: Auth now uses httpOnly cookies, no need for headers
// Kept for backward compatibility during migration
function getAuthHeaders(token?: string): HeadersInit {
    // Cookie-based auth handles authentication automatically
    // This function is deprecated and will be removed
    return {};
}

// ============ Authentication ============

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        credentials: 'include', // Include cookies - backend will set httpOnly cookie
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new ApiError(error.detail || 'Invalid credentials', response.status);
    }

    return response.json();
}

export async function getCurrentUser(): Promise<User> {
    // Auth cookie is sent automatically via credentials: 'include'
    return fetchApi<User>('/api/v1/auth/me');
}

// ============ Articles ============

export async function getArticles(params?: {
    page?: number;
    page_size?: number;
    tag?: string;
    search?: string;
}): Promise<ArticlePaginated> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return fetchApi<ArticlePaginated>(`/api/v1/articles${query ? `?${query}` : ''}`);
}

export async function getArticle(slug: string): Promise<Article> {
    return fetchApi<Article>(`/api/v1/articles/${slug}`);
}

export async function getArticleSlugs(): Promise<string[]> {
    return fetchApi<string[]>('/api/v1/articles/slugs');
}

export async function getFeaturedArticles(): Promise<ArticlePaginated> {
    return fetchApi<ArticlePaginated>('/api/v1/articles?featured=true&page_size=6');
}

export async function getRecentArticles(): Promise<ArticlePaginated> {
    return fetchApi<ArticlePaginated>('/api/v1/articles?page_size=6');
}

// ============ Projects ============

export async function getProjects(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    tag?: string;
}): Promise<ProjectPaginated> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.tag) searchParams.set('tag', params.tag);

    const query = searchParams.toString();
    return fetchApi<ProjectPaginated>(`/api/v1/projects${query ? `?${query}` : ''}`);
}

export async function getProject(slug: string): Promise<Project> {
    return fetchApi<Project>(`/api/v1/projects/${slug}`);
}

export async function getProjectSlugs(): Promise<string[]> {
    return fetchApi<string[]>('/api/v1/projects/slugs');
}

export async function getFeaturedProjects(): Promise<ProjectPaginated> {
    return fetchApi<ProjectPaginated>('/api/v1/projects?featured=true&page_size=4');
}

export async function getRecentProjects(): Promise<ProjectPaginated> {
    return fetchApi<ProjectPaginated>('/api/v1/projects?page_size=4');
}

export async function getProjectCategories(): Promise<string[]> {
    return fetchApi<string[]>('/api/v1/projects/categories');
}

// ============ Tags ============

export async function getTags(tag_type?: 'article' | 'project'): Promise<Tag[]> {
    const query = tag_type ? `?tag_type=${tag_type}` : '';
    return fetchApi<Tag[]>(`/api/v1/tags${query}`);
}

export async function createTag(data: { name: string; slug?: string; tag_type: string; color?: string }): Promise<Tag> {
    return fetchApi<Tag>('/api/v1/tags', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateTag(id: number, data: Partial<Tag>): Promise<Tag> {
    return fetchApi<Tag>(`/api/v1/tags/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteTag(id: number): Promise<void> {
    await fetchApi(`/api/v1/tags/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Profile Links ============

export async function getProfileLinks(): Promise<ProfileLink[]> {
    return fetchApi<ProfileLink[]>('/api/v1/profile-links');
}

export async function getAllProfileLinks(): Promise<ProfileLink[]> {
    return fetchApi<ProfileLink[]>('/api/v1/profile-links/all', {
        headers: getAuthHeaders(),
    });
}

export async function createProfileLink(data: Omit<ProfileLink, 'id'>): Promise<ProfileLink> {
    return fetchApi<ProfileLink>('/api/v1/profile-links', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateProfileLink(id: number, data: Partial<ProfileLink>): Promise<ProfileLink> {
    return fetchApi<ProfileLink>(`/api/v1/profile-links/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteProfileLink(id: number): Promise<void> {
    await fetchApi(`/api/v1/profile-links/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Education ============

export async function getEducation(): Promise<Education[]> {
    return fetchApi<Education[]>('/api/v1/education');
}

export async function getAllEducation(): Promise<Education[]> {
    return fetchApi<Education[]>('/api/v1/education/all', {
        headers: getAuthHeaders(),
    });
}

export async function createEducation(data: Omit<Education, 'id' | 'created_at' | 'updated_at'>): Promise<Education> {
    return fetchApi<Education>('/api/v1/education', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateEducation(id: number, data: Partial<Education>): Promise<Education> {
    return fetchApi<Education>(`/api/v1/education/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteEducation(id: number): Promise<void> {
    await fetchApi(`/api/v1/education/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Experience ============

export async function getExperiences(category?: string): Promise<Experience[]> {
    const query = category ? `?category=${category}` : '';
    return fetchApi<Experience[]>(`/api/v1/experiences${query}`);
}

export async function getAllExperiences(): Promise<Experience[]> {
    return fetchApi<Experience[]>('/api/v1/experiences/all', {
        headers: getAuthHeaders(),
    });
}

export async function createExperience(data: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> {
    return fetchApi<Experience>('/api/v1/experiences', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateExperience(id: number, data: Partial<Experience>): Promise<Experience> {
    return fetchApi<Experience>(`/api/v1/experiences/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteExperience(id: number): Promise<void> {
    await fetchApi(`/api/v1/experiences/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Skills ============

export async function getSkills(params?: { category?: string; learning?: boolean }): Promise<Skill[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.learning) searchParams.set('learning', 'true');
    const query = searchParams.toString();
    return fetchApi<Skill[]>(`/api/v1/skills${query ? `?${query}` : ''}`);
}

export async function getAllSkills(): Promise<Skill[]> {
    return fetchApi<Skill[]>('/api/v1/skills/all', {
        headers: getAuthHeaders(),
    });
}

export async function getSkillsGrouped(): Promise<Record<string, Skill[]>> {
    return fetchApi<Record<string, Skill[]>>('/api/v1/skills/grouped');
}

export async function getLearningSkills(): Promise<Skill[]> {
    return getSkills({ learning: true });
}

export async function createSkill(data: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    return fetchApi<Skill>('/api/v1/skills', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateSkill(id: number, data: Partial<Skill>): Promise<Skill> {
    return fetchApi<Skill>(`/api/v1/skills/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteSkill(id: number): Promise<void> {
    await fetchApi(`/api/v1/skills/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Publications ============

export async function getPublications(): Promise<Publication[]> {
    return fetchApi<Publication[]>('/api/v1/publications');
}

export async function getRecentPublications(): Promise<Publication[]> {
    const allPublications = await getPublications();

    // Sort by year (most recent first) and return top 4
    return allPublications
        .filter(pub => pub.year !== null)
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .slice(0, 4);
}

export async function getAllPublications(): Promise<Publication[]> {
    return fetchApi<Publication[]>('/api/v1/publications/all', {
        headers: getAuthHeaders(),
    });
}

export async function createPublication(data: Omit<Publication, 'id'>): Promise<Publication> {
    return fetchApi<Publication>('/api/v1/publications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updatePublication(id: number, data: Partial<Publication>): Promise<Publication> {
    return fetchApi<Publication>(`/api/v1/publications/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deletePublication(id: number): Promise<void> {
    await fetchApi(`/api/v1/publications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Coursework ============

export async function getCoursework(category?: string): Promise<Coursework[]> {
    const query = category ? `?category=${category}` : '';
    return fetchApi<Coursework[]>(`/api/v1/coursework${query}`);
}

export async function getCourseworkGrouped(): Promise<Record<string, Coursework[]>> {
    return fetchApi<Record<string, Coursework[]>>('/api/v1/coursework/grouped');
}

export async function getCourseworkCategories(): Promise<string[]> {
    return fetchApi<string[]>('/api/v1/coursework/categories');
}

export async function createCoursework(data: Omit<Coursework, 'id' | 'created_at' | 'updated_at'>): Promise<Coursework> {
    return fetchApi<Coursework>('/api/v1/coursework', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateCoursework(id: number, data: Partial<Coursework>): Promise<Coursework> {
    return fetchApi<Coursework>(`/api/v1/coursework/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteCoursework(id: number): Promise<void> {
    await fetchApi(`/api/v1/coursework/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Contact ============

export async function submitContactForm(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
}): Promise<ContactMessage> {
    return fetchApi<ContactMessage>('/api/v1/contact', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getContactMessages(params?: {
    page?: number;
    page_size?: number;
    unread_only?: boolean;
    include_spam?: boolean;
}): Promise<ContactMessagePaginated> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.unread_only) searchParams.set('unread_only', 'true');
    if (params?.include_spam) searchParams.set('include_spam', 'true');

    const query = searchParams.toString();
    return fetchApi<ContactMessagePaginated>(`/api/v1/contact${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders(),
    });
}

export async function getUnreadMessageCount(): Promise<number> {
    const res = await fetchApi<{ count: number }>('/api/v1/contact/unread-count', {
        headers: getAuthHeaders(),
    });
    return res.count;
}

export async function markMessageAsRead(id: number): Promise<ContactMessage> {
    return fetchApi<ContactMessage>(`/api/v1/contact/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function markMessageAsSpam(id: number): Promise<ContactMessage> {
    return fetchApi<ContactMessage>(`/api/v1/contact/${id}/spam`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function deleteContactMessage(id: number): Promise<void> {
    await fetchApi(`/api/v1/contact/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Admin — Articles ============

export async function getAdminArticles(params?: {
    page?: number;
    page_size?: number;
    status?: string;
}): Promise<ArticlePaginated> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return fetchApi<ArticlePaginated>(`/api/v1/articles/admin${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders(),
    });
}

export async function getAdminArticleById(id: number): Promise<Article> {
    return fetchApi<Article>(`/api/v1/articles/id/${id}`, {
        headers: getAuthHeaders(),
    });
}

export async function createArticle(data: Partial<Article> & { tag_ids?: number[] }): Promise<Article> {
    return fetchApi<Article>('/api/v1/articles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateArticle(id: number, data: Partial<Article> & { tag_ids?: number[] }): Promise<Article> {
    return fetchApi<Article>(`/api/v1/articles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function publishArticle(id: number): Promise<Article> {
    return fetchApi<Article>(`/api/v1/articles/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function unpublishArticle(id: number): Promise<Article> {
    return fetchApi<Article>(`/api/v1/articles/${id}/unpublish`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function deleteArticle(id: number): Promise<void> {
    await fetchApi(`/api/v1/articles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Admin — Projects ============

export async function getAdminProjects(params?: {
    page?: number;
    page_size?: number;
    status?: string;
}): Promise<ProjectPaginated> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.page_size) searchParams.set('page_size', params.page_size.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return fetchApi<ProjectPaginated>(`/api/v1/projects/admin${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders(),
    });
}

export async function getAdminProjectById(id: number): Promise<Project> {
    return fetchApi<Project>(`/api/v1/projects/id/${id}`, {
        headers: getAuthHeaders(),
    });
}

export async function createProject(data: Partial<Project> & { tag_ids?: number[] }): Promise<Project> {
    return fetchApi<Project>('/api/v1/projects', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateProject(id: number, data: Partial<Project> & { tag_ids?: number[] }): Promise<Project> {
    return fetchApi<Project>(`/api/v1/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function publishProject(id: number): Promise<Project> {
    return fetchApi<Project>(`/api/v1/projects/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function deleteProject(id: number): Promise<void> {
    await fetchApi(`/api/v1/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Upload ============

export async function uploadImage(file: File): Promise<{ filename: string; url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/v1/upload/image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new ApiError(error.detail || 'Upload failed', response.status);
    }

    return response.json();
}

export async function deleteImage(filename: string): Promise<void> {
    await fetchApi(`/api/v1/upload/image/${filename}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Gallery ============

export async function getGalleryItems(params?: {
    tag?: string;
    featured?: boolean;
}): Promise<GalleryItemBrief[]> {
    const searchParams = new URLSearchParams();
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.featured !== undefined) searchParams.set('featured', params.featured.toString());

    const query = searchParams.toString();
    return fetchApi<GalleryItemBrief[]>(`/api/v1/gallery/items${query ? `?${query}` : ''}`);
}

export async function getRecentGalleryItems(): Promise<GalleryItemBrief[]> {
    const allItems = await getGalleryItems();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return allItems
        .filter(item => {
            const publishedDate = item.published_at ? new Date(item.published_at) : new Date(item.uploaded_at);
            return publishedDate >= oneMonthAgo;
        })
        .slice(0, 6);
}

export async function getFeaturedGalleryItems(): Promise<GalleryItemBrief[]> {
    return getGalleryItems({ featured: true });
}

export async function getAllGalleryItems(tag?: string): Promise<GalleryItemBrief[]> {
    const query = tag ? `?tag=${tag}` : '';
    return fetchApi<GalleryItemBrief[]>(`/api/v1/gallery/items/all${query}`, {
        headers: getAuthHeaders(),
    });
}

export async function getGalleryItem(id: number): Promise<GalleryItem> {
    return fetchApi<GalleryItem>(`/api/v1/gallery/items/${id}`);
}

export async function getGalleryItemAdmin(id: number): Promise<GalleryItem> {
    return fetchApi<GalleryItem>(`/api/v1/gallery/items/admin/${id}`, {
        headers: getAuthHeaders(),
    });
}

export async function uploadGalleryImage(file: File): Promise<{ id: number; filename: string; url: string; size: number; width: number | null; height: number | null }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/v1/gallery/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new ApiError(error.detail || 'Upload failed', response.status);
    }

    return response.json();
}

export async function updateGalleryItem(
    id: number,
    data: {
        caption?: string | null;
        description?: string | null;
        alt_text?: string | null;
        status?: 'draft' | 'published';
        is_featured?: boolean;
        order?: number;
        tag_ids?: number[];
    }
): Promise<GalleryItem> {
    return fetchApi<GalleryItem>(`/api/v1/gallery/items/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function publishGalleryItem(id: number): Promise<GalleryItem> {
    return fetchApi<GalleryItem>(`/api/v1/gallery/items/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function unpublishGalleryItem(id: number): Promise<GalleryItem> {
    return fetchApi<GalleryItem>(`/api/v1/gallery/items/${id}/unpublish`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
}

export async function deleteGalleryItem(id: number): Promise<void> {
    await fetchApi(`/api/v1/gallery/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}

// ============ Gallery Tags ============

export async function getGalleryTags(): Promise<GalleryTag[]> {
    return fetchApi<GalleryTag[]>('/api/v1/gallery/tags');
}

export async function createGalleryTag(data: {
    name: string;
    slug?: string;
    color?: string;
}): Promise<GalleryTag> {
    return fetchApi<GalleryTag>('/api/v1/gallery/tags', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function updateGalleryTag(
    id: number,
    data: {
        name?: string;
        slug?: string;
        color?: string;
    }
): Promise<GalleryTag> {
    return fetchApi<GalleryTag>(`/api/v1/gallery/tags/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function deleteGalleryTag(id: number): Promise<void> {
    await fetchApi(`/api/v1/gallery/tags/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
}
