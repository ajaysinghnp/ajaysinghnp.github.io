import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["next-mdx-remote"],
};

const contentlayerConfig = withContentlayer(nextConfig);

export default async (...args) => {
  const resolvedConfig =
    typeof contentlayerConfig === "function"
      ? await contentlayerConfig(...args)
      : contentlayerConfig;

  return {
    ...resolvedConfig,
    turbopack: resolvedConfig?.turbopack ?? {},
  };
};
