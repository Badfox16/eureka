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
      {
        protocol: 'https',
        hostname: 'edu-eureka-bucket.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      // para imagens da api, na pasta /uploads
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      }
    ],
  },
}

module.exports = nextConfig