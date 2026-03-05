import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Proxy rewrites: en desarrollo redirigen al backend local.
  // En Vercel producción, NEXT_PUBLIC_API_URL apunta al backend Render.
  // IMPORTANTE: Los rewrites de Vercel solo funcionan para el server-side.
  // El client-side usa getBaseUrl() → '' (ruta relativa) para que las requests
  // pasen por el proxy de Next.js y puedan enviar cookies.
  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
    // Si la URL que viene de Vercel no arranca con http, se lo agregamos a la fuerza
    // para que la validación del build no falle.
    if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
      backendUrl = `https://${backendUrl}`;
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;