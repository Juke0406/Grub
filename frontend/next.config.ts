import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const config: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(config);
