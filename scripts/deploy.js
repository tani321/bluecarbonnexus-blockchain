async function main() {
  console.log("Deploying CarbonCreditRegistry contract...");
  
  const CarbonCreditRegistry = await ethers.getContractFactory("CarbonCreditRegistry");
  const contract = await CarbonCreditRegistry.deploy();
  await contract.deployed();
  
  console.log("CarbonCreditRegistry deployed to:", contract.address);
  console.log("Save this address for your React app!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});