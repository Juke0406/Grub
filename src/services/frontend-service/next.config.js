import withPWA from "next-pwa";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  redirects() {
    return [
      {
        source: "/browse",
        destination: "/browse/all",
        permanent: true,
      },
      {
        source: "/business",
        destination: "/business/products",
        permanent: true,
      },
    ];
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

export default withPWAConfig(nextConfig);
