/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose'],
  webpack: (config) => {
    config.externals.push('bcryptjs');
    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude test files and directories
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    outputFileTracingExcludes: {
      '*': ['tests/**/*', '**/*.test.*', '**/test-*'],
    },
  },
}

module.exports = nextConfig
