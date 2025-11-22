const hre = require("hardhat");

async function main() {
  console.log("Deploying HelloBlockchain contract...");

  const HelloBlockchain = await hre.ethers.getContractFactory("HelloBlockchain");
  const hello = await HelloBlockchain.deploy();

  await hello.deployed();

  console.log("HelloBlockchain deployed to:", hello.address);
  console.log("Initial message:", await hello.getMessage());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });