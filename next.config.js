module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["ipfs.io"],
  },
  rewrites: async () => {
    return [
      {
        source: "/docs",
        destination: "/docs/index.html",
      },
    ];
  },
};
