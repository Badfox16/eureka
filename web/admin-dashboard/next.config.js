/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações existentes...
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edu-eureka-bucket.s3.af-south-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig