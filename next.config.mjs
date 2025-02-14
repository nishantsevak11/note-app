/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'csb.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.csb.app',
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add these settings for better CodeSandbox compatibility
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Disable compression for better CodeSandbox performance
  compress: false
}

export default nextConfig;