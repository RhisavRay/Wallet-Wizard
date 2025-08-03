/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    appDir: true,
  },
  // Configure images to work with external domains if needed
  images: {
    domains: [],
  },
}

module.exports = nextConfig 