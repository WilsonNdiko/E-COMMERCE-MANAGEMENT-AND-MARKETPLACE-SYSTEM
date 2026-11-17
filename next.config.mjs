/** @type {import('next').NextConfig} */
const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";

const nextConfig = {
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev", "localhost", "127.0.0.1"],
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "libsql"],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa6",
      "react-icons/fa",
      "react-icons/hi",
      "react-icons/md",
      "react-icons/tb",
      "@headlessui/react",
      "date-fns",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backendInternalUrl}/api/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
