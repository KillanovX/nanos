/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // Importante para GitHub Pages carregar subpáginas diretamente
  images: {
    unoptimized: true,
  },
  basePath: '/nanos',
};

module.exports = nextConfig;
