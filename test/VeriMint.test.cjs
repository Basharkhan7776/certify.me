const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeriMint", function () {
  let veriMint;
  let owner, org1, student;
  const orgCode = "0x" + Buffer.from("UNIV01").toString("hex").padEnd(64, "0");

  beforeEach(async function () {
    [owner, org1, student] = await ethers.getSigners();
    const VeriMint = await ethers.getContractFactory("VeriMint");
    veriMint = await VeriMint.deploy();
    await veriMint.waitForDeployment();
  });

  it("should add an org", async function () {
    await veriMint.addOrg(orgCode, org1.address);
    const org = await veriMint.orgs(orgCode);
    expect(org.addr).to.equal(org1.address);
  });

  it("should mint a certificate", async function () {
    await veriMint.addOrg(orgCode, org1.address);
    const uri = "ipfs://QmTest123";
    await veriMint.connect(org1).mint(student.address, uri, orgCode);
    const cert = await veriMint.certificates(0);
    expect(cert.uri).to.equal(uri);
    expect(cert.studentAddr).to.equal(student.address);
  });

  it("should verify a certificate", async function () {
    await veriMint.addOrg(orgCode, org1.address);
    const uri = "ipfs://QmTest123";
    await veriMint.connect(org1).mint(student.address, uri, orgCode);
    const result = await veriMint.verify(0);
    expect(result[0]).to.equal(uri);
    expect(result[1]).to.equal(student.address);
    expect(result[2]).to.equal(orgCode);
  });

  it("should block transfers (soulbound)", async function () {
    await veriMint.addOrg(orgCode, org1.address);
    const uri = "ipfs://QmTest123";
    await veriMint.connect(org1).mint(student.address, uri, orgCode);
    await expect(
      veriMint.connect(student).transferFrom(student.address, owner.address, 0)
    ).to.be.rejectedWith("Soulbound: transfers not allowed");
  });

  it("should allow org to change URI", async function () {
    await veriMint.addOrg(orgCode, org1.address);
    const uri = "ipfs://QmTest123";
    await veriMint.connect(org1).mint(student.address, uri, orgCode);
    const newUri = "ipfs://QmNew456";
    await veriMint.connect(org1).uriChanger(0, newUri);
    const cert = await veriMint.certificates(0);
    expect(cert.uri).to.equal(newUri);
  });
});
