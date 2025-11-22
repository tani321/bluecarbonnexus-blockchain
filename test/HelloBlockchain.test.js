const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HelloBlockchain", function () {
  it("Should return the initial message", async function () {
    const HelloBlockchain = await ethers.getContractFactory("HelloBlockchain");
    const hello = await HelloBlockchain.deploy();
    
    expect(await hello.getMessage()).to.equal("Hello from BlueCarbon Nexus!");
  });

  it("Should update the message", async function () {
    const HelloBlockchain = await ethers.getContractFactory("HelloBlockchain");
    const hello = await HelloBlockchain.deploy();
    
    await hello.setMessage("New message!");
    expect(await hello.getMessage()).to.equal("New message!");
  });
});