/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Ensure environment variables are exposed to the browser
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Disable TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Add headers for CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL || 'http://localhost:3000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;