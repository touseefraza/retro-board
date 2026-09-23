import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /**
       * Vercel serves the root route's prerendered output at /index as well as
       * at /, which puts the home page on two URLs. Next itself 404s /index, so
       * this only ever fires in production, and it is the only way to reach the
       * duplicate from inside the app.
       */
      { source: "/index", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
