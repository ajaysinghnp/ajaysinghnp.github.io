/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: [],
};

export default nextConfig;
