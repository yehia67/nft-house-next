module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io', 'infura-ipfs.io'],
  },
  rewrites: async () => [
    {
      source: '/docs',
      destination: '/docs/index.html',
    },
  ],
};
