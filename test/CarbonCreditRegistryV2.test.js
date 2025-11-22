const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditRegistryV2", function () {
  let registry;
  let admin;
  let projectOwner;
  let buyer;
  let company;

  beforeEach(async function () {
    [admin, projectOwner, buyer, company] = await ethers.getSigners();

    const CarbonCreditRegistryV2 = await ethers.getContractFactory("CarbonCreditRegistryV2");
    registry = await CarbonCreditRegistryV2.deploy();
    await registry.deployed();
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      expect(await registry.admin()).to.equal(admin.address);
    });

    it("Should set default credit price", async function () {
      const price = await registry.pricePerCredit();
      expect(price).to.equal(ethers.utils.parseEther("0.01"));
    });
  });

  describe("Project Registration", function () {
    it("Should register a new project", async function () {
      await registry.registerProject(
        "Mumbai Mangrove Park",
        "Navi Mumbai, Maharashtra",
        projectOwner.address,
        50
      );

      const project = await registry.getProject(1);
      expect(project.name).to.equal("Mumbai Mangrove Park");
      expect(project.owner).to.equal(projectOwner.address);
    });
  });

  describe("IoT Sensor Data Recording", function () {
    beforeEach(async function () {
      await registry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
    });

    it("Should record sensor data", async function () {
      await registry.recordSensorData(
        1,           // projectId
        1500,        // CO2 absorbed in kg
        2850,        // temperature (28.50°C * 100)
        7500,        // humidity (75% * 100)
        "SENSOR001"
      );

      const sensorData = await registry.getSensorData(1);
      expect(sensorData.projectId).to.equal(1);
      expect(sensorData.co2Absorbed).to.equal(1500);
      expect(sensorData.temperature).to.equal(2850);
      expect(sensorData.humidity).to.equal(7500);
      expect(sensorData.sensorId).to.equal("SENSOR001");
    });

    it("Should track multiple sensor readings for a project", async function () {
      await registry.recordSensorData(1, 1500, 2850, 7500, "SENSOR001");
      await registry.recordSensorData(1, 1800, 2900, 7200, "SENSOR001");
      await registry.recordSensorData(1, 1600, 2800, 7600, "SENSOR002");

      const dataIds = await registry.getProjectSensorDataIds(1);
      expect(dataIds.length).to.equal(3);
    });

    it("Should only allow admin to record sensor data", async function () {
      await expect(
        registry.connect(buyer).recordSensorData(1, 1500, 2850, 7500, "SENSOR001")
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Credit Issuance with Balance Tracking", function () {
    beforeEach(async function () {
      await registry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
    });

    it("Should issue credits and update owner's balance", async function () {
      await registry.issueCredits(1, 500);

      const balance = await registry.getCreditBalance(projectOwner.address);
      expect(balance.totalCredits).to.equal(500);
      expect(balance.availableCredits).to.equal(500);
      expect(balance.usedCredits).to.equal(0);
    });

    it("Should accumulate credits for owner", async function () {
      await registry.issueCredits(1, 500);
      await registry.issueCredits(1, 300);

      const balance = await registry.getCreditBalance(projectOwner.address);
      expect(balance.totalCredits).to.equal(800);
      expect(balance.availableCredits).to.equal(800);
    });
  });

  describe("Credit Transfer", function () {
    beforeEach(async function () {
      await registry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
      await registry.issueCredits(1, 1000);
    });

    it("Should transfer credits between users", async function () {
      await registry.connect(projectOwner).transferCredits(buyer.address, 300);

      const ownerBalance = await registry.getCreditBalance(projectOwner.address);
      const buyerBalance = await registry.getCreditBalance(buyer.address);

      expect(ownerBalance.availableCredits).to.equal(700);
      expect(buyerBalance.totalCredits).to.equal(300);
      expect(buyerBalance.availableCredits).to.equal(300);
    });

    it("Should not allow transfer more than available", async function () {
      await expect(
        registry.connect(projectOwner).transferCredits(buyer.address, 1500)
      ).to.be.revertedWith("Insufficient available credits");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        registry.connect(projectOwner).transferCredits(ethers.constants.AddressZero, 100)
      ).to.be.revertedWith("Cannot transfer to zero address");
    });
  });

  describe("Credit Purchase", function () {
    beforeEach(async function () {
      await registry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
      await registry.issueCredits(1, 1000);
    });

    it("Should allow buying credits with ETH", async function () {
      const creditPrice = await registry.pricePerCredit();
      const amount = 100;
      const totalPrice = creditPrice.mul(amount);

      await registry.connect(buyer).buyCredits(projectOwner.address, amount, {
        value: totalPrice
      });

      const buyerBalance = await registry.getCreditBalance(buyer.address);
      const ownerBalance = await registry.getCreditBalance(projectOwner.address);

      expect(buyerBalance.totalCredits).to.equal(100);
      expect(ownerBalance.availableCredits).to.equal(900);
    });

    it("Should refund excess payment", async function () {
      const creditPrice = await registry.pricePerCredit();
      const amount = 100;
      const totalPrice = creditPrice.mul(amount);
      const excessPayment = ethers.utils.parseEther("1");

      const initialBalance = await buyer.getBalance();

      const tx = await registry.connect(buyer).buyCredits(projectOwner.address, amount, {
        value: totalPrice.add(excessPayment)
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await buyer.getBalance();
      const expectedBalance = initialBalance.sub(totalPrice).sub(gasUsed);

      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.utils.parseEther("0.001"));
    });

    it("Should revert if payment is insufficient", async function () {
      const creditPrice = await registry.pricePerCredit();
      const amount = 100;
      const insufficientPrice = creditPrice.mul(amount).div(2);

      await expect(
        registry.connect(buyer).buyCredits(projectOwner.address, amount, {
          value: insufficientPrice
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("Credit Usage", function () {
    beforeEach(async function () {
      await registry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
      await registry.issueCredits(1, 1000);
    });

    it("Should mark credits as used", async function () {
      await registry.connect(projectOwner).useCredits(200);

      const balance = await registry.getCreditBalance(projectOwner.address);
      expect(balance.totalCredits).to.equal(1000);
      expect(balance.availableCredits).to.equal(800);
      expect(balance.usedCredits).to.equal(200);
    });

    it("Should not allow using more than available", async function () {
      await expect(
        registry.connect(projectOwner).useCredits(1500)
      ).to.be.revertedWith("Insufficient available credits");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update credit price", async function () {
      const newPrice = ethers.utils.parseEther("0.02");
      await registry.setCreditPrice(newPrice);

      expect(await registry.pricePerCredit()).to.equal(newPrice);
    });

    it("Should not allow non-admin to update price", async function () {
      const newPrice = ethers.utils.parseEther("0.02");
      
      await expect(
        registry.connect(buyer).setCreditPrice(newPrice)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await registry.registerProject("Project 1", "Location 1", projectOwner.address, 50);
      await registry.registerProject("Project 2", "Location 2", buyer.address, 75);
      await registry.recordSensorData(1, 1500, 2850, 7500, "SENSOR001");
      await registry.recordSensorData(1, 1600, 2900, 7200, "SENSOR002");
    });

    it("Should return correct total projects", async function () {
      expect(await registry.getTotalProjects()).to.equal(2);
    });

    it("Should return correct total sensor data", async function () {
      expect(await registry.getTotalSensorData()).to.equal(2);
    });

    it("Should return all sensor data IDs for a project", async function () {
      const dataIds = await registry.getProjectSensorDataIds(1);
      expect(dataIds.length).to.equal(2);
      expect(dataIds[0]).to.equal(1);
      expect(dataIds[1]).to.equal(2);
    });
  });
});