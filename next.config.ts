import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // R3F creates a GPU context on mount. Strict Mode double-mounts in
  // development and can exhaust Chrome's WebGL context limit.
  reactStrictMode: false,
};

export default nextConfig;
