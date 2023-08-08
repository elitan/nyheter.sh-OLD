/** @type {import('next').NextConfig} */

import { withSuperjson } from 'next-superjson';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
};

export default withSuperjson()(nextConfig);

// module.exports = nextConfig
