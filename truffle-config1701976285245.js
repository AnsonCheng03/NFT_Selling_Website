module.exports = {
  contracts_build_directory: "./src/contracts",
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      from: "0xf350aedefe9ef671eca886edeaefc239a412a8b9"
    },
  },

  compilers: {
    solc: {
      version: "0.8.21",
    },
  },
};

