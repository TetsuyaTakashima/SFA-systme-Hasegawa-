import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactCompiler: true,
  typedRoutes: true,
  async redirects() {
    return [
      { source: "/list", destination: "/sales-targets", permanent: true },
      { source: "/list.html", destination: "/sales-targets", permanent: true },
      { source: "/index.html", destination: "/dashboard", permanent: true },
      { source: "/history.html", destination: "/history", permanent: true },
      { source: "/login.html", destination: "/login", permanent: true }
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
