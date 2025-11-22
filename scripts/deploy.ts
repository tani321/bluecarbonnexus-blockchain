import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");
  
  const HelloBlockchain = await hre.ethers.getContractFactory("HelloBlockchain");
  
  console.log("Deploying contract...");
  const hello = await HelloBlockchain.deploy();
  
  await hello.waitForDeployment();
  
  const address = await hello.getAddress();
  console.log("✅ Contract deployed to:", address);
  
  const message = await hello.getMessage();
  console.log("📝 Initial message:", message);
  
  console.log("\n🎉 Deployment successful! 🎉");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});