/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Altere '/nanos' para o nome exato do seu repositório no GitHub
  basePath: '/nanos',
};

module.exports = nextConfig;
