/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  allowedDevOrigins: [
    "16.171.132.141",
    "16.171.132.141:3000",
    "http://16.171.132.141",
    "http://16.171.132.141:3000",
    "localhost:3000"
  ],

  experimental: {
    serverActions: {
      allowedOrigins: ["16.171.132.141:3000", "localhost:3000"],
    },
    proxyClientMaxBodySize: '50mb',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://172.31.17.1:8080/:path*',
      },
    ]
  },
}

export default nextConfig