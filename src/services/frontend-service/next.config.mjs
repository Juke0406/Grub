import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Use Node.js runtime compatibility mode instead of Edge
  experimental: {
    runtime: "nodejs",
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Add explicit output for better Vercel compatibility
  output: "standalone",
};

// Configure PWA settings carefully to avoid conflicts
const withPWAConfig = withPWA({
  dest: "public",
  // Disable PWA in both development and staging environments
  disable: process.env.NODE_ENV !== "production",
  skipWaiting: true,
  register: true,
  // Exclude middleware-related files from service worker
  buildExcludes: [/middleware-manifest\.json$/, /_middleware\.js$/],
});

export default withPWAConfig(nextConfig);
