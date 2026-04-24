const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeriMint", function () {
  let veriMint;
  let owner, org1, org2, student1, student2;
  const orgCode1 = "0x" + Buffer.from("UNIV01").toString("hex").padEnd(64, "0");
  const orgCode2 = "0x" + Buffer.from("ACAD01").toString("hex").padEnd(64, "0");

  beforeEach(async function () {
    [owner, org1, org2, student1, student2] = await ethers.getSigners();
    const VeriMint = await ethers.getContractFactory("VeriMint");
    veriMint = await VeriMint.deploy();
    await veriMint.waitForDeployment();
  });

  describe("Org Management", function () {
    it("should add an org", async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      const org = await veriMint.orgs(orgCode1);
      expect(org.addr).to.equal(org1.address);
      expect(org.blocked).to.be.false;
    });

    it("should remove an org", async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      await veriMint.removeOrg(orgCode1);
      expect(await veriMint.orgExists(orgCode1)).to.be.false;
    });

    it("should block an org", async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      await veriMint.blockOrg(orgCode1);
      const org = await veriMint.orgs(orgCode1);
      expect(org.blocked).to.be.true;
    });

    it("should unblock an org", async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      await veriMint.blockOrg(orgCode1);
      await veriMint.unblockOrg(orgCode1);
      const org = await veriMint.orgs(orgCode1);
      expect(org.blocked).to.be.false;
    });

    it("should not allow non-owner to add org", async function () {
      await expect(
        veriMint.connect(org1).addOrg(orgCode1, org1.address)
      ).to.be.reverted;
    });

    it("should not allow non-owner to block org", async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      await expect(
        veriMint.connect(org1).blockOrg(orgCode1)
      ).to.be.reverted;
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
    });

    it("should mint a certificate", async function () {
      const uri = "ipfs://QmTest123";
      const tx = await veriMint.connect(org1).mint(student1.address, uri, orgCode1);
      const receipt = await tx.wait();
      const tokenId = receipt.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;

      const cert = await veriMint.certificates(tokenId);
      expect(cert.uri).to.equal(uri);
      expect(cert.studentAddr).to.equal(student1.address);
      expect(cert.revoked).to.be.false;
    });

    it("should not allow non-org to mint", async function () {
      await expect(
        veriMint.connect(org2).mint(student1.address, "ipfs://test", orgCode1)
      ).to.be.revertedWith("Not authorized");
    });

    it("should not allow blocked org to mint", async function () {
      await veriMint.blockOrg(orgCode1);
      await expect(
        veriMint.connect(org1).mint(student1.address, "ipfs://test", orgCode1)
      ).to.be.revertedWith("Org is blocked");
    });

    it("should emit CertRecord event on mint", async function () {
      const uri = "ipfs://QmTest123";
      await expect(
        veriMint.connect(org1).mint(student1.address, uri, orgCode1)
      ).to.emit(veriMint, "CertRecord");
    });
  });

  describe("Verification", function () {
    let tokenId;

    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      const tx = await veriMint.connect(org1).mint(student1.address, "ipfs://QmTest123", orgCode1);
      const receipt = await tx.wait();
      tokenId = receipt.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;
    });

    it("should verify a certificate", async function () {
      const result = await veriMint.verify(tokenId);
      expect(result.uri).to.equal("ipfs://QmTest123");
      expect(result.student).to.equal(student1.address);
      expect(result.orgCode).to.equal(orgCode1);
      expect(result.revoked).to.be.false;
    });

    it("should return token URI", async function () {
      const uri = await veriMint.tokenToURI(tokenId);
      expect(uri).to.equal("ipfs://QmTest123");
    });

    it("should resolve details", async function () {
      const details = await veriMint.resolveDetails(tokenId);
      expect(details.orgAddr).to.equal(org1.address);
      expect(details.studentAddr).to.equal(student1.address);
      expect(details.orgCode).to.equal(orgCode1);
    });
  });

  describe("Revocation", function () {
    let tokenId;

    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      const tx = await veriMint.connect(org1).mint(student1.address, "ipfs://QmTest123", orgCode1);
      const receipt = await tx.wait();
      tokenId = receipt.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;
    });

    it("should revoke a certificate", async function () {
      await veriMint.connect(org1).revokeCert(tokenId);
      const cert = await veriMint.certificates(tokenId);
      expect(cert.revoked).to.be.true;
    });

    it("should show revoked in verify", async function () {
      await veriMint.connect(org1).revokeCert(tokenId);
      const result = await veriMint.verify(tokenId);
      expect(result.revoked).to.be.true;
    });

    it("should not allow non-org to revoke", async function () {
      await expect(
        veriMint.connect(org2).revokeCert(tokenId)
      ).to.be.revertedWith("Not authorized");
    });

    it("should not allow blocked org to revoke", async function () {
      await veriMint.blockOrg(orgCode1);
      await expect(
        veriMint.connect(org1).revokeCert(tokenId)
      ).to.be.revertedWith("Org is blocked");
    });

    it("should emit CertRevoked event", async function () {
      await expect(
        veriMint.connect(org1).revokeCert(tokenId)
      ).to.emit(veriMint, "CertRevoked").withArgs(tokenId);
    });
  });

  describe("Soulbound", function () {
    let tokenId;

    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      const tx = await veriMint.connect(org1).mint(student1.address, "ipfs://QmTest123", orgCode1);
      const receipt = await tx.wait();
      tokenId = receipt.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;
    });

    it("should block transfers", async function () {
      await expect(
        veriMint.connect(student1).transferFrom(student1.address, owner.address, tokenId)
      ).to.be.revertedWith("Soulbound: transfers not allowed");
    });
  });

  describe("URI Changer", function () {
    let tokenId;

    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      const tx = await veriMint.connect(org1).mint(student1.address, "ipfs://QmTest123", orgCode1);
      const receipt = await tx.wait();
      tokenId = receipt.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;
    });

    it("should allow org to change URI", async function () {
      const newUri = "ipfs://QmNew456";
      await veriMint.connect(org1).uriChanger(tokenId, newUri);
      const cert = await veriMint.certificates(tokenId);
      expect(cert.uri).to.equal(newUri);
    });

    it("should emit URIChanged with old and new URI", async function () {
      const newUri = "ipfs://QmNew456";
      await expect(
        veriMint.connect(org1).uriChanger(tokenId, newUri)
      ).to.emit(veriMint, "URIChanged").withArgs(tokenId, "ipfs://QmTest123", newUri);
    });

    it("should not allow non-org to change URI", async function () {
      await expect(
        veriMint.connect(org2).uriChanger(tokenId, "ipfs://QmNew456")
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Lookup Functions", function () {
    let tokenId1, tokenId2, tokenId3;

    beforeEach(async function () {
      await veriMint.addOrg(orgCode1, org1.address);
      await veriMint.addOrg(orgCode2, org2.address);

      const tx1 = await veriMint.connect(org1).mint(student1.address, "ipfs://Qm1", orgCode1);
      const r1 = await tx1.wait();
      tokenId1 = r1.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;

      const tx2 = await veriMint.connect(org1).mint(student1.address, "ipfs://Qm2", orgCode1);
      const r2 = await tx2.wait();
      tokenId2 = r2.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;

      const tx3 = await veriMint.connect(org2).mint(student2.address, "ipfs://Qm3", orgCode2);
      const r3 = await tx3.wait();
      tokenId3 = r3.logs.find(l => l.fragment?.name === "CertMinted")?.args?.tokenId;
    });

    it("should get certs by student", async function () {
      const tokens = await veriMint.getCertsByStudent(student1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(tokenId1);
      expect(tokens[1]).to.equal(tokenId2);
    });

    it("should get certs by org", async function () {
      const tokens = await veriMint.getCertsByOrg(orgCode1);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(tokenId1);
      expect(tokens[1]).to.equal(tokenId2);
    });

    it("should return empty array for student with no certs", async function () {
      const tokens = await veriMint.getCertsByStudent(owner.address);
      expect(tokens.length).to.equal(0);
    });

    it("should return empty array for org with no certs", async function () {
      const emptyCode = "0x" + Buffer.from("EMPTY1").toString("hex").padEnd(64, "0");
      const tokens = await veriMint.getCertsByOrg(emptyCode);
      expect(tokens.length).to.equal(0);
    });
  });
});
