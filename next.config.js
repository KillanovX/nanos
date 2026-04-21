/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Se o seu repositório NÃO for o principal (username.github.io), 
  // você deve adicionar a linha abaixo com o nome do repositório:
  // basePath: '/nome-do-repositorio',
};

module.exports = nextConfig;
