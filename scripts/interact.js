const hre = require("hardhat");

async function main() {
  // Your deployed contract address
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Connect to the contract
  const HelloBlockchain = await hre.ethers.getContractFactory("HelloBlockchain");
  const hello = HelloBlockchain.attach(contractAddress);

  // Read current message
  console.log("Current message:", await hello.getMessage());

  // Update the message
  console.log("\nUpdating message...");
  const tx = await hello.setMessage("I just learned blockchain! 🚀");
  await tx.wait();
  console.log("Transaction hash:", tx.hash);

  // Read updated message
  console.log("\nNew message:", await hello.getMessage());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
