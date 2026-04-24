# agent.md — Certify.me (NFT Certificate Verification)

> Project architecture reference for AI agents, contributors, and Claude Code sessions.

---

## Project Overview

VeriMint is a two-layer certificate verification system:

- **Decentralized layer** — Solidity smart contract on Polygon. Handles minting, verification, org management, and on-chain cert storage.
- **Centralized layer** — Next.js full-stack app. Handles auth, UI, org onboarding, user profiles, and routes.

---

## Smart Contract Architecture (`/nft`)

### Structs

#### `Org`

| Field     | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `orgCode` | `bytes32` | Unique identifier for the organization |
| `addr`    | `address` | Wallet address of the org (issuer)     |
| `blocked` | `bool`    | Admin can block org from minting       |

#### `Cert`

| Field         | Type      | Description                                 |
| ------------- | --------- | ------------------------------------------- |
| `uri`         | `string`  | IPFS URI pointing to metadata JSON (Pinata) |
| `studentAddr` | `address` | Recipient's wallet address                  |
| `orgCode`     | `bytes32` | Which org issued this cert                  |
| `revoked`     | `bool`    | On-chain validity flag (false = valid)      |

---

### Contract Functions

| Function                                                   | Access     | Description                                                                                                    |
| ---------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| `mint(address student, string uri, bytes32 orgCode)`       | Org only   | Mints a soulbound ERC-721 cert to student wallet. tokenURI → Pinata IPFS. Only approved, unblocked orgs.       |
| `mintBatch(address[] students, string[] uris, bytes32 orgCode)` | Org only | Signature-based bulk minting to reduce gas costs for large issuances.                                          |
| `verify(uint256 tokenId)`                                  | Public     | Returns cert metadata: holder address, URI, org code, revoked status.                                          |
| `tokenToURI(uint256 tokenId)`                              | Public     | Returns raw IPFS URI for a given token ID.                                                                     |
| `getCertsByStudent(address student)`                       | Public     | Returns all tokenIds owned by a student wallet.                                                                |
| `getCertsByOrg(bytes32 orgCode)`                           | Public     | Returns all tokenIds issued by an organization.                                                                |
| `resolveDetails(uint256 tokenId)`                          | Public     | Returns issuer org address and holder student address for a given tokenId.                                     |
| `addOrg(bytes32 orgCode, address addr)`                    | Owner only | Registers a new institution as an authorized issuer.                                                           |
| `removeOrg(bytes32 orgCode)`                               | Owner only | Revokes an org's minting rights.                                                                               |
| `blockOrg(bytes32 orgCode)`                                | Owner only | Blocks an org from minting without removing them entirely.                                                     |
| `unblockOrg(bytes32 orgCode)`                              | Owner only | Unblocks a previously blocked org.                                                                             |
| `revokeCert(uint256 tokenId)`                              | Org only   | Sets on-chain revoked flag to true. Used for incorrect certificates — preserves immutability.                  |
| `uriChanger(uint256 tokenId, string newURI)`               | Org only   | Updates the IPFS URI (e.g. re-issue corrected cert). Org must own the cert's `orgCode`. Logs in CertRecord.    |

> **Soulbound enforcement**: `_update()` is overridden to block all transfers after minting. Certs are non-transferable by design.

---

### Off-chain Storage

| Data                                                   | Where                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| Certificate image / PDF                                | Pinata (IPFS)                                                 |
| Metadata JSON (`name`, `issuer`, `issueDate`, `expiryDate`, `description`, `achievement`, `verificationLink`) | Pinata (IPFS) |
| Achievement badge image                                | Pinata (IPFS) — separate CID per achievement                  |
| On-chain                                               | Only `tokenURI` (IPFS CID string) + `orgCode` + `studentAddr` + `revoked` flag |

### Metadata JSON Schema

```json
{
  "name": "Blockchain Fundamentals",
  "description": "Completed course on blockchain fundamentals",
  "image": "ipfs://Qm...certificate-image",
  "attributes": [
    { "trait_type": "Achievement", "value": "Course Completion" },
    { "trait_type": "Grade", "value": "A" },
    { "trait_type": "Duration", "value": "12 weeks" }
  ],
  "studentAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  "orgCode": "0x54454348...",
  "issueDate": "2025-03-15",
  "expiryDate": "2027-03-15",
  "verificationLink": "https://certify.me/verify?token=1"
}
```

> **Expiry is optional** — if `expiryDate` is omitted, the certificate never expires.

---

### Minting Flow

1. Org enters student and certificate details via frontend UI
2. Backend validates that the requesting wallet belongs to an approved, unblocked organization
3. Backend constructs standardized metadata JSON and uploads to IPFS via Pinata (protected API credentials)
4. Pinata returns CID → backend returns URI to frontend
5. Org previews certificate and explicitly initiates minting
6. Org's wallet signs transaction and submits URI to smart contract
7. Contract mints soulbound NFT to student wallet

> Only authorized issuers can mint. Metadata remains consistent, tamper-resistant, and securely linked to on-chain record.

---

### Revocation & Expiry

- **Revocation**: Handled via on-chain `revoked` flag rather than modifying metadata — preserves immutability. Org calls `revokeCert(tokenId)` to invalidate.
- **Expiry**: Stored in IPFS metadata as `expiryDate` (optional). Verification interface checks expiry client-side against current date.
- **Blocking**: Admin can `blockOrg(orgCode)` to prevent an org from minting without removing their on-chain record.

---

## Centralized App Architecture (Next.js)

### Routes

| Route              | Description                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `/`                | Landing page                                                                                   |
| `/auth`            | OAuth (Google/GitHub) + wallet connect (MetaMask / WalletConnect)                              |
| `/app`             | Dashboard — student sees their certs; org sees certs they've minted                            |
| `/verify`          | Public verification page — anyone can verify a cert using a wallet address (no login required) |
| `/org-onboarding`  | Org registration flow + admin approval queue                                                   |
| `/cert/[id]`       | Individual certificate page — fetches on-chain data + IPFS metadata, renders cert card         |
| `/org/[id]`        | Public org profile — lists all certs issued by this org                                        |
| `/profile`         | Profile page for both users and orgs                                                           |
| `/user/[id]`       | Public student profile — shows verified certificates                                           |
| `/admin`           | Admin login using email and password                                                           |
| `/admin/app`       | Admin dashboard — wallet connect for on-chain actions                                          |
| `/admin/approvals` | Admin page to review and approve org onboarding requests                                       |
| `/admin/users`     | Admin page to block/unblock users                                                              |
| `/admin/orgs`      | Admin page to block/unblock orgs                                                               |

---

### Auth Strategy (`/auth`)

- **OAuth** — Google or GitHub for non-web3 users (students, employers)
- **Wallet connect** — MetaMask / WalletConnect for orgs who need to sign mint transactions
- Session stored server-side (NextAuth.js or Lucia)
- Wallet address linked to OAuth account in DB after first connect

---

## Key Design Decisions

| Decision                                 | Reason                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| Soulbound NFT (ERC-721 + transfer block) | Certs can't be sold or transferred — mirrors real credentials                |
| `orgCode` as `bytes32` on-chain          | Gas efficient; maps to a unique string slug off-chain                        |
| Pinata for IPFS pinning                  | Reliable for hackathon; swap to NFT.storage for production permanence        |
| `uriChanger` function                    | Allows correcting a cert URI without revoking and re-minting (e.g. typo fix) |
| Public `/verify` route (no login)        | Employers verify without needing an account — zero friction                  |
| Polygon Mumbai (testnet)                 | Zero gas cost for demo; same EVM as mainnet                                  |
| Revocation via on-chain flag             | Preserves immutability — metadata on IPFS is never modified                  |
| Optional expiry in metadata              | Some certificates don't expire; handled client-side during verification      |
| Signature-based bulk minting             | Reduces gas costs for large certificate issuances                            |

---

## Tech Stack & Development Tools

### Frontend Framework
- **Next.js** (App Router) — React framework for production
- **Bun** — Fast JavaScript runtime & package manager

### UI/UX & Components
- **shadcn/ui** — Re-usable components built on Radix UI and Tailwind CSS
- **Tailwind CSS** — Utility-first CSS framework
- **Lucide React** — Icon library

### Commands (Bun)
```bash
bun dev              # Start development server
bun build            # Production build
bun lint             # Run ESLint
bun install          # Install dependencies
bunx shadcn@latest add <component>  # Add shadcn components
```

### UI/UX Guidelines
- Follow shadcn/ui design patterns for consistent components
- Use Tailwind CSS utility classes for styling
- Maintain responsive design across all breakpoints
- Ensure accessibility (a11y) compliance with Radix UI primitives
- Use consistent color scheme and typography throughout

---

## Agent Instructions (for Claude Code / AI sessions)

- The smart contract is the source of truth for cert ownership and validity. Never trust DB alone for verification.
- When minting: always upload image to Pinata first → get CID → build metadata JSON → upload JSON → get metadata CID → then call `mint()` with the metadata CID as `uri`.
- `/verify` must work without a connected wallet. Use a public RPC read call via Viem.
- Org approval is a two-step process: org submits via `/org-onboarding` → admin sets `approved: true` in DB → admin calls `addOrg()` on-chain with org's wallet.
- Never expose `OWNER_PRIVATE_KEY` to the frontend. All admin contract calls go through a server action or API route.
- `uriChanger` is an escape hatch — log every URI change in `CertRecord` for auditability.
- Verification works via QR code or token ID → routes to `/verify` → pulls metadata from IPFS → cross-checks against on-chain data.
- Revocation uses on-chain `revoked` flag, not metadata modification — preserves immutability.
- Expiry is optional in metadata; if present, verification checks `expiryDate` client-side against current date.
- `getCertsByStudent()` and `getCertsByOrg()` provide efficient lookups for student/org certificate lists.
