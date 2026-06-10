import { MetadataRoute } from 'next';

function generateRobots(siteUrl: string): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        if (process.env.NODE_ENV === 'development') {
            return generateRobots('http://localhost:3000');
        }
        throw new Error('NEXT_PUBLIC_SITE_URL must be set for production');
    }

    return generateRobots(siteUrl);
}
