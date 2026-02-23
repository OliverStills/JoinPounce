import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: 'JoinPounce — Stop Missing Sales on Things You Actually Want',
        template: '%s | JoinPounce',
    },
    description:
        'JoinPounce watches your wishlist and notifies you the moment prices drop. Save money on Amazon, Target, Walmart, Best Buy, and Wayfair automatically.',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://joinpounce.com'),
    openGraph: {
        type: 'website',
        siteName: 'JoinPounce',
        title: 'JoinPounce — Stop Missing Sales on Things You Actually Want',
        description:
            'JoinPounce watches your wishlist and notifies you the moment prices drop.',
        url: 'https://joinpounce.com',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JoinPounce — Price Drop Alerts',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'JoinPounce — Stop Missing Sales on Things You Actually Want',
        description: 'JoinPounce watches your wishlist and notifies you the moment prices drop.',
        images: ['/og-image.png'],
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.className} bg-navy-950 text-white antialiased`}>
                {children}
            </body>
        </html>
    );
}
