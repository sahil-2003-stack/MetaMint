require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    megatestnet: {
      url: "https://carrot.megaeth.com/rpc", // Replace with your Mega Testnet RPC URL
      chainId: 6342,                    // Replace with the correct chain ID
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
