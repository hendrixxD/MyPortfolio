import type { Metadata } from 'next';
import '@fontsource/inter/latin.css';
import '@fontsource/jetbrains-mono/latin.css';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/context/ThemeProvider';
import { PageTracker } from '@/components/PageTracker';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
        default: 'lengedandungjoshua | Data Engineer & Chemical/Petroleum Technology',
        template: '%s | lengedandungjoshua',
    },
    description:
        'Portfolio of lengedandungjoshua - Data Engineer and Chemical/Petroleum Technology professional. Explore my projects, articles, and technical expertise.',
    keywords: [
        'Data Engineer',
        'Chemical Engineering',
        'Petroleum Technology',
        'Python',
        'Data Pipelines',
        'Portfolio',
        'Technical Writing',
    ],
    authors: [{ name: 'lengedandungjoshua' }],
    creator: 'lengedandungjoshua',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: '/',
        siteName: 'lengedandungjoshua',
        title: 'lengedandungjoshua | Data Engineer & Chemical/Petroleum Technology',
        description:
            'Portfolio of lengedandungjoshua - Data Engineer and Chemical/Petroleum Technology professional.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'lengedandungjoshua Portfolio',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'lengedandungjoshua | Data Engineer',
        description:
            'Portfolio of lengedandungjoshua - Data Engineer and Chemical/Petroleum Technology professional.',
        creator: '@hendrixxjdl',
        images: ['/og-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: 'data:,',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="data:," />
            </head>
            <body className="font-sans antialiased">
                <ThemeProvider>
                    <PageTracker />
                    <a href="#main-content" className="skip-link">
                        Skip to main content
                    </a>
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <main id="main-content" className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
