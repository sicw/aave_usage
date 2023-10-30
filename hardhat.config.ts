import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: "https://arb-mainnet.g.alchemy.com/v2/wf0tf5Kj5dez25BZEm7OOthCX1t5MV3s",
        blockNumber: 145402233,
      }
    }
  }
};

export default config;
