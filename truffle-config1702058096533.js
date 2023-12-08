module.exports = {
  contracts_build_directory: "./src/contracts",
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: "0xc3a49c1e9decd75c75372b67db62c1aec7ee56d2"
    },
  },

  compilers: {
    solc: {
      version: "0.8.21",
    },
  },
};

