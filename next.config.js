/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.screenshotmachine.com", "www.google.com"],
    remotePatterns: [
      {
        protocol: "https",https://fast.com/ja/#
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // PWA用の設定（next-pwaを使う場合）
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
  },
};

module.exports = nextConfig;
