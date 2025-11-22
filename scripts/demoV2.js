const hre = require("hardhat");

async function main() {
  const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  
  // Get accounts
  const [admin, projectOwner1, projectOwner2, company, buyer] = await hre.ethers.getSigners();
  
  const CarbonCreditRegistryV2 = await hre.ethers.getContractFactory("CarbonCreditRegistryV2");
  const registry = CarbonCreditRegistryV2.attach(contractAddress);

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   BLUECARNON NEXUS - Carbon Credit Registry V2 Demo       ║");
  console.log("║   Smart India Hackathon 2025 - Team Bluenova              ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  console.log("👤 Participants:");
  console.log("   Admin:", admin.address);
  console.log("   Project Owner 1:", projectOwner1.address);
  console.log("   Project Owner 2:", projectOwner2.address);
  console.log("   Company (Buyer):", company.address);
  console.log();

  // ========== PHASE 1: PROJECT REGISTRATION ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 PHASE 1: Registering Mangrove Conservation Projects");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🌿 Registering Project 1: Airoli Mangrove Reserve...");
  let tx = await registry.registerProject(
    "Airoli Mangrove Reserve",
    "Navi Mumbai, Maharashtra",
    projectOwner1.address,
    50
  );
  await tx.wait();
  console.log("   ✅ Project 1 registered successfully!\n");

  console.log("🌿 Registering Project 2: Thane Creek Mangroves...");
  tx = await registry.registerProject(
    "Thane Creek Mangroves",
    "Thane, Maharashtra",
    projectOwner2.address,
    75
  );
  await tx.wait();
  console.log("   ✅ Project 2 registered successfully!\n");

  const totalProjects = await registry.getTotalProjects();
  console.log("📊 Total Projects Registered:", totalProjects.toString());
  console.log();

  // ========== PHASE 2: IOT DATA RECORDING ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔬 PHASE 2: Recording IoT Sensor Data from Mangroves");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📡 Recording sensor data for Project 1 (Week 1)...");
  tx = await registry.recordSensorData(
    1,
    1500,    // 1500 kg CO2 absorbed
    2850,    // 28.50°C
    7500,    // 75% humidity
    "SENSOR-AIROLI-001"
  );
  await tx.wait();
  console.log("   ✅ Data recorded: 1500 kg CO2, Temp: 28.50°C, Humidity: 75%\n");

  console.log("📡 Recording sensor data for Project 1 (Week 2)...");
  tx = await registry.recordSensorData(
    1,
    1800,    // 1800 kg CO2
    2920,    // 29.20°C
    7200,    // 72% humidity
    "SENSOR-AIROLI-001"
  );
  await tx.wait();
  console.log("   ✅ Data recorded: 1800 kg CO2, Temp: 29.20°C, Humidity: 72%\n");

  console.log("📡 Recording sensor data for Project 2 (Week 1)...");
  tx = await registry.recordSensorData(
    2,
    2200,    // 2200 kg CO2
    2780,    // 27.80°C
    7800,    // 78% humidity
    "SENSOR-THANE-001"
  );
  await tx.wait();
  console.log("   ✅ Data recorded: 2200 kg CO2, Temp: 27.80°C, Humidity: 78%\n");

  const totalSensorData = await registry.getTotalSensorData();
  console.log("📊 Total Sensor Readings:", totalSensorData.toString());
  
  const project1SensorIds = await registry.getProjectSensorDataIds(1);
  console.log("📊 Project 1 has", project1SensorIds.length, "sensor readings");
  console.log();

  // ========== PHASE 3: CREDIT ISSUANCE ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💎 PHASE 3: Issuing Carbon Credits Based on Data");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💰 Issuing 500 credits to Project 1...");
  tx = await registry.issueCredits(1, 500);
  await tx.wait();
  console.log("   ✅ 500 credits issued!\n");

  console.log("💰 Issuing 750 credits to Project 2...");
  tx = await registry.issueCredits(2, 750);
  await tx.wait();
  console.log("   ✅ 750 credits issued!\n");

  let balance1 = await registry.getCreditBalance(projectOwner1.address);
  let balance2 = await registry.getCreditBalance(projectOwner2.address);
  
  console.log("📊 Credit Balances:");
  console.log("   Project Owner 1:", balance1.totalCredits.toString(), "credits");
  console.log("   Project Owner 2:", balance2.totalCredits.toString(), "credits");
  console.log();

  // ========== PHASE 4: CREDIT TRADING ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 PHASE 4: Trading Carbon Credits");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const creditPrice = await registry.pricePerCredit();
  console.log("💵 Current Credit Price:", hre.ethers.utils.formatEther(creditPrice), "ETH per credit\n");

  console.log("🏢 Company buying 200 credits from Project Owner 1...");
  const purchaseAmount = 200;
  const totalCost = creditPrice.mul(purchaseAmount);
  console.log("   Total cost:", hre.ethers.utils.formatEther(totalCost), "ETH");
  
  const ownerBalanceBefore = await hre.ethers.provider.getBalance(projectOwner1.address);
  
  tx = await registry.connect(company).buyCredits(projectOwner1.address, purchaseAmount, {
    value: totalCost
  });
  await tx.wait();
  
  const ownerBalanceAfter = await hre.ethers.provider.getBalance(projectOwner1.address);
  const earned = ownerBalanceAfter.sub(ownerBalanceBefore);
  
  console.log("   ✅ Purchase complete!");
  console.log("   💰 Project Owner earned:", hre.ethers.utils.formatEther(earned), "ETH\n");

  balance1 = await registry.getCreditBalance(projectOwner1.address);
  const companyBalance = await registry.getCreditBalance(company.address);
  
  console.log("📊 Updated Balances:");
  console.log("   Project Owner 1:", balance1.availableCredits.toString(), "credits available");
  console.log("   Company:", companyBalance.totalCredits.toString(), "credits owned");
  console.log();

  // ========== PHASE 5: CREDIT USAGE ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("♻️  PHASE 5: Using Credits for Carbon Offsetting");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🏢 Company offsetting 100 tons of CO2 by using 100 credits...");
  tx = await registry.connect(company).useCredits(100);
  await tx.wait();
  console.log("   ✅ 100 credits marked as used for carbon offsetting!\n");

  const finalCompanyBalance = await registry.getCreditBalance(company.address);
  console.log("📊 Company's Final Balance:");
  console.log("   Total credits:", finalCompanyBalance.totalCredits.toString());
  console.log("   Available:", finalCompanyBalance.availableCredits.toString());
  console.log("   Used for offsetting:", finalCompanyBalance.usedCredits.toString());
  console.log();

  // ========== FINAL SUMMARY ==========
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📈 FINAL SYSTEM SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const project1 = await registry.getProject(1);
  const project2 = await registry.getProject(2);
  
  console.log("🌿 Project Statistics:");
  console.log("   Total Projects:", (await registry.getTotalProjects()).toString());
  console.log("   Total Sensor Readings:", (await registry.getTotalSensorData()).toString());
  console.log("   Total Credits Issued:", project1.carbonCredits.add(project2.carbonCredits).toString());
  console.log();

  console.log("💰 Credit Distribution:");
  balance1 = await registry.getCreditBalance(projectOwner1.address);
  balance2 = await registry.getCreditBalance(projectOwner2.address);
  const finalCompanyBal = await registry.getCreditBalance(company.address);
  
  console.log("   Project Owner 1:", balance1.totalCredits.toString(), "credits (", balance1.availableCredits.toString(), "available)");
  console.log("   Project Owner 2:", balance2.totalCredits.toString(), "credits (", balance2.availableCredits.toString(), "available)");
  console.log("   Company:", finalCompanyBal.totalCredits.toString(), "credits (", finalCompanyBal.usedCredits.toString(), "used for offsetting)");
  console.log();

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         Demo Complete - All Systems Operational! ✅        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
