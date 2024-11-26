import "@nomicfoundation/hardhat-toolbox";

// Ensure your configuration variables are set before executing the script
const { vars } = require("hardhat/config");

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and add it to the configuration variables

// Add your Sepolia account private key to the configuration variables
// To export your private key from Coinbase Wallet, go to
// Settings > Developer Settings > Show private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Beware: NEVER put real Ether into testing accounts
const SEPOLIA_PRIVATE_KEY =
  "b613562780245ca0bf8a4b1c7e1ece48be5c145fd98b26f63bf9dd5fe72e5fed";

module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/b0546e09d7a24477b82039a967ecad56`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
