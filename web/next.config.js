/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Allow images from supported retailer CDNs
    images: {
        remotePatterns: [
            // Amazon
            { protocol: 'https', hostname: 'm.media-amazon.com' },
            { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
            // Target
            { protocol: 'https', hostname: 'target.scene7.com' },
            // Walmart
            { protocol: 'https', hostname: 'i5.walmartimages.com' },
            // Best Buy
            { protocol: 'https', hostname: 'pisces.bbystatic.com' },
            // Wayfair
            { protocol: 'https', hostname: 'secure.img1-fg.wfcdn.com' },
        ],
    },

    // Proxy API calls in development
    async rewrites() {
        return process.env.NODE_ENV === 'development'
            ? [
                {
                    source: '/api/:path*',
                    destination: `${process.env.API_URL ?? 'http://localhost:8080'}/api/:path*`,
                },
            ]
            : [];
    },
};

module.exports = nextConfig;
