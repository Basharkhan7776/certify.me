// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VeriMint is ERC721, Ownable {
    struct Org {
        bytes32 orgCode;
        address addr;
        bool blocked;
    }

    struct Cert {
        string uri;
        address studentAddr;
        bytes32 orgCode;
        bool revoked;
    }

    mapping(bytes32 => Org) public orgs;
    mapping(bytes32 => bool) public orgExists;
    mapping(uint256 => Cert) public certificates;
    mapping(address => uint256[]) private _studentTokens;
    mapping(bytes32 => uint256[]) private _orgTokens;

    uint256 private _nextTokenId;

    event OrgAdded(bytes32 orgCode, address addr);
    event OrgRemoved(bytes32 orgCode);
    event OrgBlocked(bytes32 orgCode);
    event OrgUnblocked(bytes32 orgCode);
    event CertMinted(uint256 tokenId, address student, string uri, bytes32 orgCode);
    event CertRevoked(uint256 tokenId);
    event URIChanged(uint256 tokenId, string oldURI, string newURI);
    event CertRecord(uint256 tokenId, address student, bytes32 orgCode, string uri);

    constructor() ERC721("VeriMint Certificate", "VERI") Ownable(msg.sender) {}

    modifier onlyOrg(bytes32 orgCode) {
        require(orgExists[orgCode], "Org does not exist");
        require(orgs[orgCode].addr == msg.sender, "Not authorized");
        require(!orgs[orgCode].blocked, "Org is blocked");
        _;
    }

    function addOrg(bytes32 orgCode, address addr) external onlyOwner {
        require(!orgExists[orgCode], "Org already exists");
        orgs[orgCode] = Org(orgCode, addr, false);
        orgExists[orgCode] = true;
        emit OrgAdded(orgCode, addr);
    }

    function removeOrg(bytes32 orgCode) external onlyOwner {
        require(orgExists[orgCode], "Org does not exist");
        delete orgs[orgCode];
        delete orgExists[orgCode];
        emit OrgRemoved(orgCode);
    }

    function blockOrg(bytes32 orgCode) external onlyOwner {
        require(orgExists[orgCode], "Org does not exist");
        orgs[orgCode].blocked = true;
        emit OrgBlocked(orgCode);
    }

    function unblockOrg(bytes32 orgCode) external onlyOwner {
        require(orgExists[orgCode], "Org does not exist");
        orgs[orgCode].blocked = false;
        emit OrgUnblocked(orgCode);
    }

    function mint(address student, string calldata uri, bytes32 orgCode) external onlyOrg(orgCode) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(student, tokenId);
        certificates[tokenId] = Cert(uri, student, orgCode, false);
        _studentTokens[student].push(tokenId);
        _orgTokens[orgCode].push(tokenId);
        emit CertMinted(tokenId, student, uri, orgCode);
        emit CertRecord(tokenId, student, orgCode, uri);
        return tokenId;
    }

    function revokeCert(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert storage cert = certificates[tokenId];
        require(orgExists[cert.orgCode], "Org does not exist");
        require(orgs[cert.orgCode].addr == msg.sender, "Not authorized");
        require(!orgs[cert.orgCode].blocked, "Org is blocked");
        cert.revoked = true;
        emit CertRevoked(tokenId);
    }

    function verify(uint256 tokenId) external view returns (string memory uri, address student, bytes32 orgCode, bool revoked) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert memory cert = certificates[tokenId];
        return (cert.uri, cert.studentAddr, cert.orgCode, cert.revoked);
    }

    function tokenToURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return certificates[tokenId].uri;
    }

    function getCertsByStudent(address student) external view returns (uint256[] memory) {
        return _studentTokens[student];
    }

    function getCertsByOrg(bytes32 orgCode) external view returns (uint256[] memory) {
        return _orgTokens[orgCode];
    }

    function resolveDetails(uint256 tokenId) external view returns (address orgAddr, address studentAddr, bytes32 orgCode) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert memory cert = certificates[tokenId];
        return (orgs[cert.orgCode].addr, cert.studentAddr, cert.orgCode);
    }

    function uriChanger(uint256 tokenId, string calldata newURI) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        Cert storage cert = certificates[tokenId];
        require(orgExists[cert.orgCode], "Org does not exist");
        require(orgs[cert.orgCode].addr == msg.sender, "Not authorized");
        string memory oldURI = cert.uri;
        cert.uri = newURI;
        emit URIChanged(tokenId, oldURI, newURI);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfers not allowed");
        }
        return super._update(to, tokenId, auth);
    }
}
