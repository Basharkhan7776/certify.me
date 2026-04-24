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

#### `Cert`

| Field         | Type      | Description                                 |
| ------------- | --------- | ------------------------------------------- |
| `uri`         | `string`  | IPFS URI pointing to metadata JSON (Pinata) |
| `studentAddr` | `address` | Recipient's wallet address                  |
| `orgCode`     | `bytes32` | Which org issued this cert                  |

---

### Contract Functions

| Function                                             | Access     | Description                                                                            |
| ---------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------- |
| `mint(address student, string uri, bytes32 orgCode)` | Org only   | Mints a soulbound ERC-721 cert to student wallet. tokenURI → Pinata IPFS               |
| `verify(uint256 tokenId)`                            | Public     | Returns cert metadata: holder address, URI, org code                                   |
| `tokenToURI(uint256 tokenId)`                        | Public     | Returns raw IPFS URI for a given token ID                                              |
| `addOrg(bytes32 orgCode, address addr)`              | Owner only | Registers a new institution as an authorized issuer                                    |
| `removeOrg(bytes32 orgCode)`                         | Owner only | Revokes an org's minting rights                                                        |
| `uriChanger(uint256 tokenId, string newURI)`         | Org only   | Updates the IPFS URI (e.g. re-issue corrected cert). Org must own the cert's `orgCode` |

> **Soulbound enforcement**: `_update()` is overridden to block all transfers after minting. Certs are non-transferable by design.

---

### Off-chain Storage

| Data                                                   | Where                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| Certificate image / PDF                                | Pinata (IPFS)                                                 |
| Metadata JSON (`name`, `issuer`, `date`, `attributes`) | Pinata (IPFS)                                                 |
| Achievement badge image                                | Pinata (IPFS) — separate CID per achievement                  |
| On-chain                                               | Only `tokenURI` (IPFS CID string) + `orgCode` + `studentAddr` |

---

## Centralized App Architecture (Next.js)

### Routes

| Route             | Description                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`               | Landing page                                                                                               |
| `/auth`           | OAuth (Google/GitHub) + wallet connect (MetaMask / WalletConnect)                                          |
| `/app`            | Dashboard — student sees their certs; org sees certs they've minted                                        |
| `/verify`         | Public verification page — anyone can verify a cert using a wallet address or token ID (no login required) |
| `/org-onboarding` | Org registration flow + admin approval queue                                                               |
| `/cert/[id]`      | Individual certificate page — fetches on-chain data + IPFS metadata, renders cert card                     |
| `/org/[id]`       | Public org profile — lists all certs issued by this org                                                    |
| `/profile`        | Logged-in user's profile and linked wallet                                                                 |
| `/user/[id]`      | Public student profile — shows verified certificates                                                       |

---

### Auth Strategy (`/auth`)

- **OAuth** — Google or GitHub for non-web3 users (students, employers)
- **Wallet connect** — MetaMask / WalletConnect for orgs who need to sign mint transactions
- Session stored server-side (NextAuth.js or Lucia)
- Wallet address linked to OAuth account in DB after first connect

---

## Database Schema (PostgreSQL via Prisma)

```prisma
model Org {
  id          String   @id @default(cuid())
  orgCode     String   @unique   // mirrors on-chain orgCode (hex)
  name        String
  walletAddr  String   @unique
  approved    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model User {
  id          String   @id @default(cuid())
  email       String?  @unique
  walletAddr  String?  @unique
  name        String?
  createdAt   DateTime @default(now())
}

model CertRecord {
  id          String   @id @default(cuid())
  tokenId     Int      @unique
  orgCode     String
  studentAddr String
  ipfsUri     String
  issuedAt    DateTime @default(now())
}
```

---

## Environment Variables

```env
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=80001
RPC_URL=https://rpc-mumbai.maticvigil.com

# IPFS
PINATA_JWT=...
PINATA_GATEWAY=https://gateway.pinata.cloud

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Admin
OWNER_PRIVATE_KEY=...   # only used in deploy scripts, never exposed to client
```

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

---

## Folder Structure

```
verimint/
├── contracts/
│   └── VeriMint.sol          # Main ERC-721 soulbound contract
├── scripts/
│   └── deploy.ts             # Hardhat deploy → Polygon Mumbai
├── test/
│   └── VeriMint.test.ts
├── app/                      # Next.js App Router
│   ├── page.tsx              # /
│   ├── auth/page.tsx         # /auth
│   ├── app/page.tsx          # /app (dashboard)
│   ├── verify/page.tsx       # /verify
│   ├── org-onboarding/page.tsx
│   ├── cert/[id]/page.tsx
│   ├── org/[id]/page.tsx
│   ├── profile/page.tsx
│   └── user/[id]/page.tsx
├── lib/
│   ├── contract.ts           # Viem contract client (read/write)
│   ├── pinata.ts             # Upload image + metadata to IPFS
│   ├── prisma.ts             # DB client
│   └── auth.ts               # NextAuth config
├── prisma/
│   └── schema.prisma
├── hardhat.config.ts
└── agent.md                  # ← you are here
```

---

## Agent Instructions (for Claude Code / AI sessions)

- The smart contract is the source of truth for cert ownership and validity. Never trust DB alone for verification.
- When minting: always upload image to Pinata first → get CID → build metadata JSON → upload JSON → get metadata CID → then call `mint()` with the metadata CID as `uri`.
- `/verify` must work without a connected wallet. Use a public RPC read call via Viem.
- Org approval is a two-step process: org submits via `/org-onboarding` → admin sets `approved: true` in DB → admin calls `addOrg()` on-chain with org's wallet.
- Never expose `OWNER_PRIVATE_KEY` to the frontend. All admin contract calls go through a server action or API route.
- `uriChanger` is an escape hatch — log every URI change in `CertRecord` for auditability.
