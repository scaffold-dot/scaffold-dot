import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Ignore optional wallet connectors that we don't need
    config.ignoreWarnings = [
      { module: /@gemini-wallet\/core/ },
      { module: /porto/ },
      { module: /@react-native-async-storage/ },
      { module: /react-native/ },
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      "@gemini-wallet/core": false,
      "porto": false,
      // Ignore React Native dependencies (used by MetaMask SDK but not needed in web)
      "@react-native-async-storage/async-storage": false,
      "react-native": false,
      "react-native-randombytes": false,
    };

    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
