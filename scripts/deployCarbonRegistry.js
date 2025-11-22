const hre = require("hardhat");

async function main() {
  console.log("Deploying CarbonCreditRegistry contract...");

  const CarbonCreditRegistry = await hre.ethers.getContractFactory("CarbonCreditRegistry");
  const registry = await CarbonCreditRegistry.deploy();

  await registry.deployed();

  console.log("CarbonCreditRegistry deployed to:", registry.address);
  console.log("Admin address:", await registry.admin());
  console.log("Total projects:", await registry.getTotalProjects());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
