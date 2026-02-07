import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin"],
  transpilePackages: ["@splinetool/react-spline"],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 80, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'in.pinterest.com',
      },
      {
        protocol: 'https',
        hostname: 'pin.it',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpapers.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'nekos.best',
      },
      {
        protocol: 'https',
        hostname: 'www.mekathlon.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  allowedDevOrigins: [
    "192.168.1.100:3000",
    "192.168.56.1:3000",
    "localhost:3000",
    "127.0.0.1:3000",
    "*.localhost"
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};


export default nextConfig;
