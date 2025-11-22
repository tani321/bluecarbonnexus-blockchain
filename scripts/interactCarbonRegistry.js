const hre = require("hardhat");

async function main() {
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  const CarbonCreditRegistry = await hre.ethers.getContractFactory("CarbonCreditRegistry");
  const registry = CarbonCreditRegistry.attach(contractAddress);

  console.log("=== Carbon Credit Registry Demo ===\n");

  // Register first project
  console.log("📝 Registering Project 1: Airoli Mangrove Reserve...");
  let tx = await registry.registerProject(
    "Airoli Mangrove Reserve",
    "Navi Mumbai, Maharashtra",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
    50 // 50 hectares
  );
  await tx.wait();
  console.log("✅ Project 1 registered!\n");

  // Register second project
  console.log("📝 Registering Project 2: Thane Creek Mangroves...");
  tx = await registry.registerProject(
    "Thane Creek Mangroves",
    "Thane, Maharashtra",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
    75 // 75 hectares
  );
  await tx.wait();
  console.log("✅ Project 2 registered!\n");

  // Check total projects
  const total = await registry.getTotalProjects();
  console.log("📊 Total Projects:", total.toString());

  // Get details of Project 1
  console.log("\n=== Project 1 Details ===");
  const project1 = await registry.getProject(1);
  console.log("ID:", project1.id.toString());
  console.log("Name:", project1.name);
  console.log("Location:", project1.location);
  console.log("Owner:", project1.owner);
  console.log("Area:", project1.areaInHectares.toString(), "hectares");
  console.log("Carbon Credits:", project1.carbonCredits.toString());
  console.log("Active:", project1.isActive);

  // Issue credits to Project 1
  console.log("\n💰 Issuing 500 carbon credits to Project 1...");
  tx = await registry.issueCredits(1, 500);
  await tx.wait();
  console.log("✅ Credits issued!");

  // Issue more credits
  console.log("\n💰 Issuing 300 more credits to Project 1...");
  tx = await registry.issueCredits(1, 300);
  await tx.wait();
  console.log("✅ Credits issued!");

  // Check updated credits
  const updatedProject = await registry.getProject(1);
  console.log("\n📊 Project 1 Total Credits:", updatedProject.carbonCredits.toString());

  // Issue credits to Project 2
  console.log("\n💰 Issuing 1000 credits to Project 2...");
  tx = await registry.issueCredits(2, 1000);
  await tx.wait();
  console.log("✅ Credits issued!");

  // Final summary
  console.log("\n=== FINAL SUMMARY ===");
  const p1 = await registry.getProject(1);
  const p2 = await registry.getProject(2);
  console.log("Project 1 (" + p1.name + "):", p1.carbonCredits.toString(), "credits");
  console.log("Project 2 (" + p2.name + "):", p2.carbonCredits.toString(), "credits");
  
  const totalCredits = p1.carbonCredits.add(p2.carbonCredits);
  console.log("\n🌍 Total Carbon Credits Issued:", totalCredits.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
