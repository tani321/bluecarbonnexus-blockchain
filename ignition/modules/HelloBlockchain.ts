import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HelloBlockchainModule = buildModule("HelloBlockchainModule", (m) => {
  const hello = m.contract("HelloBlockchain");
  return { hello };
});

export default HelloBlockchainModule;