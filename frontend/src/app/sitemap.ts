import { MetadataRoute } from 'next';
import { getArticleSlugs, getProjectSlugs } from '@/lib/api';

function generateSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
    return Promise.resolve(createSitemapEntries(baseUrl));
}

async function createSitemapEntries(siteUrl: string): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages = [
        '',
        '/articles',
        '/projects',
        '/tech',
        '/academia',
        '/profiles',
        '/contact',
        '/resume',
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic article pages
    let articlePages: MetadataRoute.Sitemap = [];
    try {
        const articleSlugs = await getArticleSlugs();
        articlePages = articleSlugs.map((slug) => ({
            url: `${siteUrl}/articles/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching article slugs for sitemap:', error);
    }

    // Dynamic project pages
    let projectPages: MetadataRoute.Sitemap = [];
    try {
        const projectSlugs = await getProjectSlugs();
        projectPages = projectSlugs.map((slug) => ({
            url: `${siteUrl}/projects/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching project slugs for sitemap:', error);
    }

    return [...staticPages, ...articlePages, ...projectPages];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        if (process.env.NODE_ENV === 'development') {
            return generateSitemap('http://localhost:3000');
        }
        throw new Error('NEXT_PUBLIC_SITE_URL must be set for production');
    }

    return createSitemapEntries(siteUrl);
}
