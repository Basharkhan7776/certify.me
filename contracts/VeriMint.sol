// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VeriMint is ERC721, Ownable {
    struct Org {
        bytes32 orgCode;
        address addr;
    }

    struct Cert {
        string uri;
        address studentAddr;
        bytes32 orgCode;
    }

    mapping(bytes32 => Org) public orgs;
    mapping(bytes32 => bool) public orgExists;
    mapping(uint256 => Cert) public certificates;

    uint256 private _nextTokenId;

    event OrgAdded(bytes32 orgCode, address addr);
    event OrgRemoved(bytes32 orgCode);
    event CertMinted(uint256 tokenId, address student, string uri, bytes32 orgCode);
    event URIChanged(uint256 tokenId, string newURI);

    constructor() ERC721("VeriMint Certificate", "VERI") Ownable(msg.sender) {}

    modifier onlyOrg(bytes32 orgCode) {
        require(orgExists[orgCode], "Org does not exist");
        require(orgs[orgCode].addr == msg.sender, "Not authorized");
        _;
    }

    function addOrg(bytes32 orgCode, address addr) external onlyOwner {
        require(!orgExists[orgCode], "Org already exists");
        orgs[orgCode] = Org(orgCode, addr);
        orgExists[orgCode] = true;
        emit OrgAdded(orgCode, addr);
    }

    function removeOrg(bytes32 orgCode) external onlyOwner {
        require(orgExists[orgCode], "Org does not exist");
        delete orgs[orgCode];
        delete orgExists[orgCode];
        emit OrgRemoved(orgCode);
    }

    function mint(address student, string calldata uri, bytes32 orgCode) external onlyOrg(orgCode) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(student, tokenId);
        certificates[tokenId] = Cert(uri, student, orgCode);
        emit CertMinted(tokenId, student, uri, orgCode);
        return tokenId;
    }

    function verify(uint256 tokenId) external view returns (string memory, address, bytes32) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert memory cert = certificates[tokenId];
        return (cert.uri, cert.studentAddr, cert.orgCode);
    }

    function tokenToURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return certificates[tokenId].uri;
    }

    function uriChanger(uint256 tokenId, string calldata newURI) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert storage cert = certificates[tokenId];
        require(orgExists[cert.orgCode], "Org does not exist");
        require(orgs[cert.orgCode].addr == msg.sender, "Not authorized");
        cert.uri = newURI;
        emit URIChanged(tokenId, newURI);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers not allowed");
        }
        return super._update(to, tokenId, auth);
    }
}
