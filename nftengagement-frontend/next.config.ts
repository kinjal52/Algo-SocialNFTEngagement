/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ['localhost', 'vercel.svg'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: "**",
        port: '',
        pathname: '/uploads/**',
      },     
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
  
};

module.exports = nextConfig;