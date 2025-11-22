const hre = require("hardhat");

async function main() {
  console.log("Deploying CarbonCreditRegistryV2...");

  const CarbonCreditRegistryV2 = await hre.ethers.getContractFactory("CarbonCreditRegistryV2");
  const registry = await CarbonCreditRegistryV2.deploy();
  await registry.deployed();

  console.log("\n✅ CarbonCreditRegistryV2 deployed to:", registry.address);
  console.log("Admin address:", await registry.admin());
  console.log("Default credit price:", hre.ethers.utils.formatEther(await registry.pricePerCredit()), "ETH");
  console.log("Total projects:", (await registry.getTotalProjects()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
