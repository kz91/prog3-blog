import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Local development config
    reactStrictMode: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
}

export default nextConfig
