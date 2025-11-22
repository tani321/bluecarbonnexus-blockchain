const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditRegistry", function () {
  let carbonRegistry;
  let admin;
  let projectOwner;
  let buyer;

  beforeEach(async function () {
    // Get test accounts
    [admin, projectOwner, buyer] = await ethers.getSigners();

    // Deploy contract
    const CarbonCreditRegistry = await ethers.getContractFactory("CarbonCreditRegistry");
    carbonRegistry = await CarbonCreditRegistry.deploy();
    await carbonRegistry.deployed();
  });

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      expect(await carbonRegistry.admin()).to.equal(admin.address);
    });

    it("Should start with zero projects", async function () {
      expect(await carbonRegistry.getTotalProjects()).to.equal(0);
    });
  });

  describe("Project Registration", function () {
    it("Should register a new project", async function () {
      await carbonRegistry.registerProject(
        "Mumbai Mangrove Park",
        "Navi Mumbai, Maharashtra",
        projectOwner.address,
        50
      );

      expect(await carbonRegistry.getTotalProjects()).to.equal(1);

      const project = await carbonRegistry.getProject(1);
      expect(project.name).to.equal("Mumbai Mangrove Park");
      expect(project.location).to.equal("Navi Mumbai, Maharashtra");
      expect(project.owner).to.equal(projectOwner.address);
      expect(project.areaInHectares).to.equal(50);
      expect(project.carbonCredits).to.equal(0);
      expect(project.isActive).to.equal(true);
    });

    it("Should only allow admin to register projects", async function () {
      await expect(
        carbonRegistry.connect(buyer).registerProject(
          "Unauthorized Project",
          "Somewhere",
          buyer.address,
          10
        )
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });

  describe("Credit Issuance", function () {
    beforeEach(async function () {
      // Register a project first
      await carbonRegistry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
    });

    it("Should issue credits to a project", async function () {
      await carbonRegistry.issueCredits(1, 500);

      const project = await carbonRegistry.getProject(1);
      expect(project.carbonCredits).to.equal(500);
    });

    it("Should accumulate credits over multiple issuances", async function () {
      await carbonRegistry.issueCredits(1, 500);
      await carbonRegistry.issueCredits(1, 300);

      const project = await carbonRegistry.getProject(1);
      expect(project.carbonCredits).to.equal(800);
    });

    it("Should only allow admin to issue credits", async function () {
      await expect(
        carbonRegistry.connect(buyer).issueCredits(1, 500)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not issue credits to inactive projects", async function () {
      await carbonRegistry.deactivateProject(1);

      await expect(
        carbonRegistry.issueCredits(1, 500)
      ).to.be.revertedWith("Project is not active");
    });
  });

  describe("Project Management", function () {
    beforeEach(async function () {
      await carbonRegistry.registerProject(
        "Test Project",
        "Test Location",
        projectOwner.address,
        100
      );
    });

    it("Should deactivate a project", async function () {
      await carbonRegistry.deactivateProject(1);

      const project = await carbonRegistry.getProject(1);
      expect(project.isActive).to.equal(false);
    });
  });
});