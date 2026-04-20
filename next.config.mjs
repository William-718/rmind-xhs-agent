/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/chat': ['./data/**'],
  },
}

export default nextConfig
