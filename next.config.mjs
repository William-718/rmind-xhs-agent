/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/chat': [
      './**/*.skill/**',
      './ system prompt/**',
      './data/**',
    ],
  },
}

export default nextConfig
